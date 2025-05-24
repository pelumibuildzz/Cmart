import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { updateBusinessImage, getBusinessByUserId } from '@/lib/services/business.service';
import { Role } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only business users can update business images
    if (session.user.role !== Role.BUSINESS) {
      return NextResponse.json(
        { message: 'Only business users can update business images' },
        { status: 403 }
      );
    }

    // Get the current business for the user
    const business = await getBusinessByUserId(session.user.id);
    if (!business) {
      return NextResponse.json(
        { message: 'Business not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image || !(image instanceof File) || image.size === 0) {
      return NextResponse.json(
        { message: 'No valid image provided' },
        { status: 400 }
      );
    }

    // Validate image
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    if (!ALLOWED_TYPES.includes(image.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    if (image.size > MAX_SIZE) {
      return NextResponse.json(
        { message: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Update the business image
    const updatedBusiness = await updateBusinessImage(business.id, image);

    return NextResponse.json({
      message: 'Business image updated successfully',
      business: {
        id: updatedBusiness.id,
        name: updatedBusiness.name,
        imageUrl: updatedBusiness.imageUrl,
        imageFileId: updatedBusiness.imageFileId
      }
    });
  } catch (error) {
    console.error('Error updating business image:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
