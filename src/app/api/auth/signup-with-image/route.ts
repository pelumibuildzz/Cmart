import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/services/user.service';
import { createBusiness, createBusinessWithoutImageUpload } from '@/lib/services/business.service';
import { Role } from '@/lib/constants';
import { prisma } from '@/lib/server/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Extract fields from form data
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const universityId = formData.get('universityId') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const role = formData.get('role') as Role;
    const businessName = formData.get('businessName') as string;
    const businessDescription = formData.get('businessDescription') as string;
    const bankName = formData.get('bankName') as string;
    const accountNumber = formData.get('accountNumber') as string;
    const businessImage = formData.get('businessImage') as File;
    
    // Get category and subcategory IDs
    const categoryIds = formData.getAll('categoryIds') as string[];
    const subCategoryIds = formData.getAll('subCategoryIds') as string[];
      // Validate input
    if (!name || !email || !password || !universityId || !role || !phoneNumber) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (role === Role.BUSINESS && (!businessName || !businessDescription || !categoryIds || categoryIds.length === 0)) {
      return NextResponse.json(
        { message: 'Missing required business fields' },
        { status: 400 }
      );
    }

    // Additional validation for bank details if it's a business
    if (role === Role.BUSINESS && (!bankName || !accountNumber)) {
      return NextResponse.json(
        { message: 'Bank name and account number are required for business accounts' },
        { status: 400 }
      );
    }
    
    // Validate business image if provided
    if (businessImage && businessImage instanceof File) {
      const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

      if (!ALLOWED_IMAGE_TYPES.includes(businessImage.type)) {
        return NextResponse.json(
          { message: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
          { status: 400 }
        );
      }

      if (businessImage.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { message: 'File size too large. Maximum size is 5MB.' },
          { status: 400 }
        );
      }
    }
    
    // Check if user with email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }    // Handle image upload outside of transaction to avoid timeout
    let imageUploadData: { imageUrl?: string; imageFileId?: string } = {};
    
    if (role === Role.BUSINESS && businessImage && businessImage instanceof File) {
      try {
        const { uploadImage } = await import('@/lib/services/imagekit.service');
        const uploadResult = await uploadImage(
          businessImage,
          `${Date.now()}-${businessImage.name}`,
          'businesses'
        );
        imageUploadData = {
          imageUrl: uploadResult.url,
          imageFileId: uploadResult.fileId
        };
      } catch (error) {
        console.error('Error uploading business image:', error);
        // Continue with business creation even if image upload fails
      }
    }

    // Use a transaction with increased timeout for database operations only
    const result = await prisma.$transaction(async (prisma) => {
      // Create new user using the user service
      const user = await createUser({
        name,
        email,
        password,
        phoneNumber,
        universityId,
        role,
      });

      // If it's a business user, create the business
      if (role === Role.BUSINESS) {
        const businessData = {
          userId: user.id,
          name: businessName,
          description: businessDescription,
          bankName,
          accountNumber,
          universityId,
          categoryIds,
          subCategoryIds: subCategoryIds.length > 0 ? subCategoryIds : undefined,
          ...imageUploadData, // Include pre-uploaded image data
        };
        
        // Use the business service to create the business (without image upload)
        const businessRecord = await createBusinessWithoutImageUpload(businessData);

        // Update user with business reference
        await prisma.user.update({
          where: { id: user.id },
          data: {
            business: {
              connect: {
                id: businessRecord.id
              }
            }
          },
        });

        // Return user with business info
        return {
          ...user,
          business: businessRecord,
        };
      }

      return user;
    }, {
      timeout: 10000, // Increase timeout to 10 seconds
    });
    
    // Don't return the password in the response
    const { password: _, ...userWithoutPassword } = result;
    
    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
