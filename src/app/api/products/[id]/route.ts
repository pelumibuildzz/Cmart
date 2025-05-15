import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { updateProduct, getProductById, deleteProduct } from '@/lib/services/product.service';
import { Role } from '@/lib/constants';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if the product exists and belongs to the user's business
    const existingProduct = await getProductById(params.id);
    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    // Only the business owner can update their products
    if (session.user.role !== Role.BUSINESS || existingProduct.business.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'You do not have permission to update this product' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const updateData: any = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      categoryId: formData.get('categoryId'),
      isAvailable: formData.get('isAvailable') === 'true'
    };

    // Handle optional image updates
    const newMainImage = formData.get('image');
    if (newMainImage instanceof File) {
      updateData.image = newMainImage;
    }

    const newImages = formData.getAll('images');
    if (newImages.length > 0 && newImages[0] instanceof File) {
      updateData.images = newImages as File[];
    }

    const updatedProduct = await updateProduct(params.id, updateData);
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { message: 'Error updating product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if the product exists and belongs to the user's business
    const existingProduct = await getProductById(params.id);
    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    // Only the business owner can delete their products
    if (session.user.role !== Role.BUSINESS || existingProduct.business.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'You do not have permission to delete this product' },
        { status: 403 }
      );
    }

    await deleteProduct(params.id);
    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { message: 'Error deleting product' },
      { status: 500 }
    );
  }
}