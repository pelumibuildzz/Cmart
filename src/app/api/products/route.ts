import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { createProduct } from '@/lib/services/product.service';
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

    // Only business users can create products
    if (session.user.role !== Role.BUSINESS) {
      return NextResponse.json(
        { message: 'Only business users can create products' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const image = formData.get('image') as File;
    const price = Number(formData.get('price'));
    const stock = Number(formData.get('stock'));
    const businessId = formData.get('businessId') as string;
    const categoryId = formData.get('categoryId') as string;
    const isAvailable = formData.get('isAvailable') === 'true';
    const additionalImages = formData.getAll('images') as File[];

    const product = await createProduct({
      name,
      description,
      image,
      price,
      stock,
      businessId,
      categoryId,
      isAvailable,
      images: additionalImages,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { message: 'Error creating product' },
      { status: 500 }
    );
  }
}