'use server';

import { getBusinessById } from '@/lib/services/business.service';

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