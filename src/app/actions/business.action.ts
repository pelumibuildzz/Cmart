'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { Role } from '@/lib/constants';
import { revalidatePath } from 'next/cache';
import { getBusinessById, updateBusiness, updateBusinessImage, getBusinessByUserId } from '@/lib/services/business.service';

export async function fetchBusinessData(businessId: string) {
  try {
    const business = await getBusinessById(businessId);
    if (!business) {
      return null;
    }
    
    // Return business with its categories and subcategories
    return {
      id: business.id,
      name: business.name,
      description: business.description,
      imageUrl: business.imageUrl,
      categories: business.categories.map(cat => ({
        id: cat.id,
        name: cat.name
      })),
      subCategories: business.subCategories.map(subCat => ({
        id: subCat.id,
        name: subCat.name
      }))
    };
  } catch (error) {
    console.error('Error fetching business:', error);
    return null;
  }
}

export async function updateBusinessProfileAction(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return { error: 'Unauthorized' };
    }

    if (session.user.role !== Role.BUSINESS) {
      return { error: 'Only business users can update a business profile' };
    }

    // Get the business ID from the user's business
    const business = await getBusinessByUserId(session.user.id);
    if (!business) {
      return { error: 'Business not found' };
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const bankName = formData.get('bankName') as string;
    const accountNumber = formData.get('accountNumber') as string;

    // Get category IDs and subcategory IDs if provided
    const categoryIds = formData.getAll('categoryIds') as string[];
    const subCategoryIds = formData.getAll('subCategoryIds') as string[];

    const updateData: any = {
      name,
      description,
      bankName: bankName || undefined,
      accountNumber: accountNumber || undefined,
    };

    if (categoryIds.length > 0) {
      updateData.categoryIds = categoryIds;
    }

    if (subCategoryIds.length > 0) {
      updateData.subCategoryIds = subCategoryIds;
    }

    const updatedBusiness = await updateBusiness(business.id, updateData);

    revalidatePath('/business/profile');
    revalidatePath('/markets');
    revalidatePath(`/markets/${business.id}`);
    
    return { success: true, business: updatedBusiness };
  } catch (error) {
    console.error('Error updating business profile:', error);
    return { error: 'Error updating business profile' };
  }
}

export async function updateBusinessImageAction(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return { error: 'Unauthorized' };
    }

    if (session.user.role !== Role.BUSINESS) {
      return { error: 'Only business users can update a business image' };
    }

    // Get the business ID from the user's business
    const business = await getBusinessByUserId(session.user.id);
    if (!business) {
      return { error: 'Business not found' };
    }

    const image = formData.get('image') as File;
    if (!image || !(image instanceof File) || image.size === 0) {
      return { error: 'No valid image provided' };
    }

    // Validate image
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      return { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' };
    }

    if (image.size > MAX_FILE_SIZE) {
      return { error: 'File size too large. Maximum size is 5MB.' };
    }

    const updatedBusiness = await updateBusinessImage(business.id, image);

    revalidatePath('/business/profile');
    revalidatePath('/markets');
    revalidatePath(`/markets/${business.id}`);
    
    return { success: true, business: updatedBusiness };
  } catch (error) {
    console.error('Error updating business image:', error);
    return { error: 'Error updating business image' };
  }
}