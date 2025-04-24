'use server';

import { getCategories } from '@/lib/services/category.service';

export async function fetchCategories() {
  try {
    const categories = await getCategories();
    return { categories };
  } catch (error) {
    return { error: 'Failed to fetch categories' };
  }
}