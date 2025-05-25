import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/services/user.service';
import { createBusiness } from '@/lib/services/business.service';
import { Role } from '@/lib/constants';
import { prisma } from '@/lib/server/prisma';

export async function POST(request: Request) {
  try {
    const { name, email, phoneNumber, password, universityId, role, business } = await request.json();
    
    // Validate input
    if (!name || !email || !password || !universityId || !role || !phoneNumber) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (role === Role.BUSINESS && (!business?.name || !business?.description || !business?.categoryIds || business.categoryIds.length === 0)) {
      return NextResponse.json(
        { message: 'Missing required business fields' },
        { status: 400 }
      );
    }

    // Additional validation for bank details if it's a business
    if (role === Role.BUSINESS && (!business?.bankName || !business?.accountNumber)) {
      return NextResponse.json(
        { message: 'Bank name and account number are required for business accounts' },
        { status: 400 }
      );
    }
    
    // Check if user with email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Use a transaction to ensure both user and business are created successfully
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
          name: business.name,
          description: business.description,
          bankName: business.bankName,
          accountNumber: business.accountNumber,
          universityId: business.universityId,
          categoryIds: business.categoryIds,  // Now passing array of category IDs
          subCategoryIds: business.subCategoryIds,  // Optional subcategory IDs
        };
        
        // Use the business service to create the business
        const businessRecord = await createBusiness(businessData);

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