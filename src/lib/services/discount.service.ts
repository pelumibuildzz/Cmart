import { prisma } from '../server/prisma';
import { DiscountTier, DISCOUNT_RULES } from '@/types/discount';

export async function getDiscountsByUserId(userId: string) {
  return prisma.discount.findMany({
    where: {
      userId,
      isUsed: false,
      expiresAt: {
        gt: new Date()
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function getDiscountById(id: string) {
  return prisma.discount.findUnique({
    where: { id },
    include: {
      user: true
    }
  });
}

export async function createDiscount(data: {
  userId: string;
  percentage: number;
  expiresAt?: Date;
}) {
  return prisma.discount.create({
    data: {
      ...data,
      expiresAt: data.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days by default
    },
    include: {
      user: true
    }
  });
}

export async function utilizeDiscount(id: string, orderId: string) {
  return prisma.discount.update({
    where: { id },
    data: {
      isUsed: true,
      usedAt: new Date(),
      orderId
    },
    include: {
      user: true,
      order: true
    }
  });
}

export async function updateUserDiscountTier(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalOrders: true, discountTier: true }
  });

  if (!user) return null;

  // Determine new discount tier
  let newTier = DiscountTier.NONE;
  for (const [tier, rules] of Object.entries(DISCOUNT_RULES)) {
    if (user.totalOrders >= rules.minOrders) {
      newTier = tier as DiscountTier;
    }
  }

  // If tier changed, update and possibly create a new discount
  if (newTier !== user.discountTier) {
    const percentage = DISCOUNT_RULES[newTier].percentage;
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { discountTier: newTier }
    });

    // Create new discount if eligible
    if (percentage > 0) {
      await createDiscount({
        userId,
        percentage
      });
    }

    return updatedUser;
  }

  return user;
}

export async function incrementUserOrderCount(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) return null;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { 
      totalOrders: { increment: 1 } 
    }
  });

  // Check if user should receive a new discount tier
  await updateUserDiscountTier(userId);

  return updatedUser;
} 