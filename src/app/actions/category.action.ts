'use server';

import { 
  getCategories, 
  getSubCategories, 
  getSubCategoriesByCategoryId,
  getCategoryById,
  createSubCategory
} from '@/lib/services/category.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { Role } from '@/lib/constants';

export async function fetchCategories() {
  try {
    const categories = await getCategories();
    return { categories };
  } catch (error) {
    return { error: 'Failed to fetch categories' };
  }
}

export async function fetchSubCategories() {
  try {
    const subCategories = await getSubCategories();
    return { subCategories };
  } catch (error) {
    return { error: 'Failed to fetch subcategories' };
  }
}

export async function fetchCategoryDetails(categoryId: string) {
  try {
    const category = await getCategoryById(categoryId);
    if (!category) {
      return { error: 'Category not found' };
    }
    
    return { 
      category,
      subCategories: category.subCategories
    };
  } catch (error) {
    return { error: 'Failed to fetch category details' };
  }
}

export async function fetchSubCategoriesByCategory(categoryId: string) {
  try {
    const subCategories = await getSubCategoriesByCategoryId(categoryId);
    return { subCategories };
  } catch (error) {
    return { error: 'Failed to fetch subcategories for this category' };
  }
}

export async function createSubCategoryAction(name: string, categoryId: string, signupMode: boolean = false) {
  try {
    // Skip authentication check if in signup mode
    if (!signupMode) {
      const session = await getServerSession(authOptions);
      
      if (!session) {
        return { error: 'Unauthorized' };
      }

      if (session.user.role !== Role.BUSINESS && session.user.role !== Role.ADMIN) {
        return { error: 'Only business owners and admins can create subcategories' };
      }
    }

    // Check if the category exists
    const category = await getCategoryById(categoryId);
    if (!category) {
      return { error: 'Category not found' };
    }

    // Create the subcategory
    const subcategory = await createSubCategory({
      name,
      categoryId
    });

    return { success: true, subcategory };
  } catch (error: any) {
    console.error('Error creating subcategory:', error);
    return { error: error.message || 'Failed to create subcategory' };
  }
}