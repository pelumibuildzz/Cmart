import { PrismaClient } from '@prisma/client';
import { DiscountTier, DISCOUNT_RULES } from '../types/discount';
import { updateUserDiscountTier as updateTier } from '../lib/services/discount.service';
import { prisma } from '../lib/server/prisma';

// This function is kept for backward compatibility
// but we should migrate to using the service directly
export async function updateUserDiscountTier(
  prisma: PrismaClient,
  userId: string
) {
  // Get user's total orders
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalOrders: true, discountTier: true }
  });

  if (!user) return;

  // Determine new discount tier
  let newTier = DiscountTier.NONE;
  for (const [tier, rules] of Object.entries(DISCOUNT_RULES)) {
    if (user.totalOrders >= rules.minOrders) {
      newTier = tier as DiscountTier;
    }
  }

  // If tier changed, create new discount
  if (newTier !== user.discountTier) {
    const percentage = DISCOUNT_RULES[newTier].percentage;
    
    await prisma.$transaction([
      // Update user's tier
      prisma.user.update({
        where: { id: userId },
        data: { discountTier: newTier }
      }),
      // Create new discount if eligible
      percentage > 0 ? prisma.discount.create({
        data: {
          userId,
          percentage,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      }) : undefined
    ].filter(Boolean));
  }
}

// This function can be called directly when needed
export async function processUserDiscountTier(userId: string) {
  return updateTier(userId);
}

// This function can be used in background jobs or scheduled tasks
export async function processAllUserDiscountTiers() {
  // Get all users
  const users = await prisma.user.findMany({
    select: { id: true }
  });
  
  // Process each user's discount tier
  const promises = users.map(user => updateTier(user.id));
  await Promise.all(promises);
  
  return { processed: users.length };
}