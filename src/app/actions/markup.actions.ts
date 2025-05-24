'use server';

import { getSession } from '@/lib/auth/session';
import { Role } from '@/lib/constants';
import { prisma } from '@/lib/server/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Updates the markup percentage for a single product
 * Also recalculates the final price based on the base price and new markup
 */
export async function updateProductMarkup(productId: string, markupPercent: number) {
  try {
    // Verify admin permissions
    const session = await getSession();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      throw new Error('Unauthorized: Only admins can update product markups');
    }

    // Get the current product
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Calculate the new final price based on the base price and the new markup
    const finalPrice = product.basePrice * (1 + markupPercent / 100);

    // Update the product
    await prisma.product.update({
      where: { id: productId },
      data: {
        markupPercent,
        finalPrice
      }
    });
    
    revalidatePath('/admin/markup');
    revalidatePath('/products');
    revalidatePath('/markets');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating product markup:', error);
    return { error: error.message || 'Failed to update markup' };
  }
}

/**
 * Updates the markup percentage for all products
 * Also recalculates the final price for each product
 */
export async function updateAllProductsMarkup(markupPercent: number) {
  try {
    // Verify admin permissions
    const session = await getSession();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      throw new Error('Unauthorized: Only admins can update product markups');
    }

    // Get all products
    const products = await prisma.product.findMany();

    // Update each product with the new markup and recalculated final price
    const updatePromises = products.map(product => {
      const finalPrice = product.basePrice * (1 + markupPercent / 100);
      
      return prisma.product.update({
        where: { id: product.id },
        data: {
          markupPercent,
          finalPrice
        }
      });
    });

    // Execute all updates in parallel
    await Promise.all(updatePromises);
    
    revalidatePath('/admin/markup');
    revalidatePath('/products');
    revalidatePath('/markets');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating all product markups:', error);
    return { error: error.message || 'Failed to update markups' };
  }
}
