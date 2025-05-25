'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { createProduct, updateProduct, deleteProduct, getProductById, getRelatedProducts } from '@/lib/services/product.service';
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
    const basePrice = Number(formData.get('basePrice'));
    const markupPercent = 15; // Fixed at 15% regardless of what's in the form
    const finalPrice = basePrice * (1 + markupPercent / 100);
    const stock = Number(formData.get('stock'));
    const isAvailable = formData.get('isAvailable') === 'true';
    const additionalImages = formData.getAll('images') as File[];
    const videos = formData.getAll('videos') as File[];
    
    // Handle multiple categories
    const categoryIds = formData.getAll('categoryIds') as string[];
    
    // Handle multiple subcategories
    const subCategoryIds = formData.getAll('subCategoryIds') as string[];

    if (!name || !description || !image || !basePrice || stock === undefined || categoryIds.length === 0) {
      return { error: 'Missing required fields' };
    }

    const product = await createProduct({
      name,
      description,
      image,
      basePrice,
      markupPercent,
      finalPrice,
      stock,
      businessId: business.id,
      categoryIds,
      subCategoryIds: subCategoryIds.length > 0 ? subCategoryIds : undefined,
      isAvailable,
      images: additionalImages,
      videos: videos.length > 0 ? videos : undefined,
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

    if (session.user.role !== Role.BUSINESS || existingProduct.business.userId !== session.user.id) {
      return { error: 'You do not have permission to update this product' };
    }

    // Start with basic fields that are always included
    const basePrice = Number(formData.get('basePrice'));
    const markupPercent = 15; // Fixed at 15%
    const finalPrice = basePrice * (1 + markupPercent / 100);
    
    const updateData: Partial<CreateProductData> = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      basePrice,
      markupPercent,
      finalPrice,
      stock: Number(formData.get('stock')),
      isAvailable: formData.get('isAvailable') === 'true'
    };

    // Handle categories and subcategories
    const categoryIds = formData.getAll('categoryIds') as string[];
    if (categoryIds.length > 0) {
      updateData.categoryIds = categoryIds;
    }

    const subCategoryIds = formData.getAll('subCategoryIds') as string[];
    if (subCategoryIds.length > 0) {
      updateData.subCategoryIds = subCategoryIds;
    }

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

    // Only add videos field if new videos are provided and they're valid Files
    const newVideos = formData.getAll('videos');
    if (newVideos.length > 0 && newVideos.every(video => video instanceof File && video.size > 0)) {
      updateData.videos = newVideos as File[];
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

    if (session.user.role !== Role.BUSINESS || existingProduct.business.userId !== session.user.id) {
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

export async function getRelatedProductsAction(productId: string) {
  try {
    if (!productId) {
      return { error: 'Product ID is required' };
    }

    const relatedProducts = await getRelatedProducts(productId);
    
    return { success: true, data: relatedProducts };
  } catch (error) {
    console.error('Error fetching related products:', error);
    return { error: 'Failed to fetch related products' };
  }
}