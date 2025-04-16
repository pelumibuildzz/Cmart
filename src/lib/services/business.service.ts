import { prisma } from '../server/prisma';

export async function getBusinessById(id: string) {
  return prisma.business.findUnique({
    where: { id },
    include: {
      products: true
    }
  });
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
      products: true
    }
  });
}

export async function createBusiness(data: any) {
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    throw new Error('Invalid category ID');
  }

  return prisma.business.create({
    data,
    include: {
      category: true,
      products: true,
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