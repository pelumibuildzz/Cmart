'use server';

import { getSession } from '@/lib/auth/session';
import { 
  getDiscountsByUserId, 
  getDiscountById,
  updateUserDiscountTier
} from '@/lib/services/discount.service';
import { revalidatePath } from 'next/cache';

export async function fetchUserDiscounts() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }
    
    const discounts = await getDiscountsByUserId(session.user.id);
    return { discounts };
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return { error: 'Failed to fetch discounts' };
  }
}

export async function fetchDiscountById(id: string) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }
    
    const discount = await getDiscountById(id);
    
    if (!discount || discount.userId !== session.user.id) {
      return { error: 'Discount not found or not owned by user' };
    }
    
    return { discount };
  } catch (error) {
    console.error('Error fetching discount:', error);
    return { error: 'Failed to fetch discount' };
  }
}

export async function refreshUserDiscountTier() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }
    
    const user = await updateUserDiscountTier(session.user.id);
    
    if (!user) {
      return { error: 'User not found' };
    }
    
    revalidatePath('/profile');
    return { user };
  } catch (error) {
    console.error('Error updating discount tier:', error);
    return { error: 'Failed to update discount tier' };
  }
} 