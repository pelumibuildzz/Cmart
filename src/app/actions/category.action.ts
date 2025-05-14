'use server';

import { 
  getCategories, 
  getSubCategories, 
  getSubCategoriesByCategoryId,
  getCategoryById
} from '@/lib/services/category.service';

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