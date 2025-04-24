'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { createProduct, updateProduct, deleteProduct, getProductById } from '@/lib/services/product.service';
import { Role } from '@/lib/constants';
import { revalidatePath } from 'next/cache';
import { CreateProductData } from '@/types/product';
import { getBusinessByUserId } from '@/lib/services/business.service';

export async function createProductAction(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return { error: 'Unauthorized' };
    }

    if (session.user.role !== Role.BUSINESS) {
      return { error: 'Only business users can create products' };
    }

    // Get the business ID from the user's business
    const business = await getBusinessByUserId(session.user.id);
    if (!business) {
      return { error: 'Business not found' };
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const image = formData.get('image') as File;
    const price = Number(formData.get('price'));
    const stock = Number(formData.get('stock'));
    const categoryId = formData.get('categoryId') as string;
    const isAvailable = formData.get('isAvailable') === 'true';
    const additionalImages = formData.getAll('images') as File[];

    if (!name || !description || !image || !price || stock === undefined || !categoryId) {
      return { error: 'Missing required fields' };
    }

    const product = await createProduct({
      name,
      description,
      image,
      price,
      stock,
      businessId: business.id, // Use the business ID from the user's business
      categoryId,
      isAvailable,
      images: additionalImages,
    });

    revalidatePath('/markets/[businessId]', 'page');
    revalidatePath('/', 'page');
    
    return { success: true, product };
  } catch (error) {
    console.error('Error creating product:', error);
    return { error: 'Error creating product' };
  }
}

export async function updateProductAction(productId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return { error: 'Unauthorized' };
    }

    const existingProduct = await getProductById(productId);
    if (!existingProduct) {
      return { error: 'Product not found' };
    }

    if (session.user.role !== Role.BUSINESS || existingProduct.Business.userId !== session.user.id) {
      return { error: 'You do not have permission to update this product' };
    }

    // Start with basic fields that are always included
    const updateData: Partial<CreateProductData> = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      categoryId: formData.get('categoryId') as string,
      isAvailable: formData.get('isAvailable') === 'true'
    };

    // Only add image field if a new image is provided and it's a valid File
    const newMainImage = formData.get('image');
    if (newMainImage instanceof File && newMainImage.size > 0) {
      updateData.image = newMainImage;
    }

    // Only add images field if new images are provided and they're valid Files
    const newImages = formData.getAll('images');
    if (newImages.length > 0 && newImages.every(img => img instanceof File && img.size > 0)) {
      updateData.images = newImages as File[];
    }

    const updatedProduct = await updateProduct(productId, updateData);

    revalidatePath('/markets/[businessId]', 'page');
    revalidatePath('/products/[productId]', 'page');
    revalidatePath('/', 'page');
    
    return { success: true, product: updatedProduct };
  } catch (error) {
    console.error('Error updating product:', error);
    return { error: 'Error updating product' };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return { error: 'Unauthorized' };
    }

    const existingProduct = await getProductById(productId);
    if (!existingProduct) {
      return { error: 'Product not found' };
    }

    if (session.user.role !== Role.BUSINESS || existingProduct.Business.userId !== session.user.id) {
      return { error: 'You do not have permission to delete this product' };
    }

    await deleteProduct(productId);

    revalidatePath('/markets/[businessId]', 'page');
    revalidatePath('/', 'page');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { error: 'Error deleting product' };
  }
}