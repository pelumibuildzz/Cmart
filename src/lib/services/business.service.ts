import { prisma } from '../server/prisma';

interface CreateBusinessData {
  userId: string;
  name: string;
  description: string;
  universityId: string;
  categoryId: string;
}

export async function getBusinessById(id: string) {
  try {
    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            images: true // This is likely missing
          }
        }
      }
    });
    return business;
  } catch (error) {
    console.error('Error fetching business:', error);
    return null;
  }
}

export async function getBusinessByUserId(userId: string) {
  return prisma.business.findUnique({
    where: { userId },
    include: {
      products: true
    }
  });
}

export async function getBusinesses(
  params: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
  } = {}
) {
  const { skip, take, where, orderBy } = params;
  return prisma.business.findMany({
    skip,
    take,
    where,
    orderBy,
    include: {
      products: true,
      user: true,    
      category: true,
      orders: true   
    }
  });
}

export async function createBusiness(data: CreateBusinessData) {
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    throw new Error('Invalid category ID');
  }

  return prisma.business.create({
    data: {
      name: data.name,
      description: data.description,
      universityId: data.universityId,
      categoryId: data.categoryId,
      userId: data.userId,
      isVerified: false
    },
    include: {
      category: true,
      products: true,
      user: true
    },
  });
}

export async function updateBusiness(id: string, data: any) {
  return prisma.business.update({
    where: { id },
    data,
    include: {
      products: true
    }
  });
}

export async function deleteBusiness(id: string) {
  return prisma.business.delete({
    where: { id },
    include: {
      products: true
    }
  });
}