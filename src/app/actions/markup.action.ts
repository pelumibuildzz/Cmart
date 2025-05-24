'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { Role } from '@/lib/constants';
import { prisma } from '@/lib/server/prisma';

/**
 * Updates the markup percentage for a single product
 * This will also recalculate the final price based on the base price and new markup
 */
export async function updateProductMarkup(productId: string, markupPercent: number) {
  try {
    const session = await getServerSession(authOptions);
    
    // Validate admin permissions
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
    return await prisma.product.update({
      where: { id: productId },
      data: {
        markupPercent,
        finalPrice
      }
    });
  } catch (error) {
    console.error('Error updating product markup:', error);
    throw error;
  }
}

/**
 * Updates the markup percentage for all products
 * This will also recalculate the final price for each product
 */
export async function updateAllProductsMarkup(markupPercent: number) {
  try {
    const session = await getServerSession(authOptions);
    
    // Validate admin permissions
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
    return await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error updating all product markups:', error);
    throw error;
  }
}
