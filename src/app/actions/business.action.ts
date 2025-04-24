'use server';

import { getBusinessById } from '@/lib/services/business.service';

export async function fetchBusinessData(businessId: string) {
  try {
    const business = await getBusinessById(businessId);
    if (!business) {
      return null;
    }
    
    // Only return necessary data
    return {
      id: business.id,
      name: business.name
    };
  } catch (error) {
    console.error('Error fetching business:', error);
    return null;
  }
}