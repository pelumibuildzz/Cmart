import { prisma } from '../server/prisma';

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
  });
}

export async function getProducts(
  params: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
  } = {}
) {
  const { skip, take, where, orderBy } = params;
  return prisma.product.findMany({
    skip,
    take,
    where,
    orderBy,
  });
}

export async function createProduct(data: any) {
  const business = await prisma.business.findUnique({ where: { id: data.businessId } });
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!business || !category) {
    throw new Error('Invalid business or category ID');
  }

  return prisma.product.create({
    data,
    include: {
      Business: true, 
      category: true, 
    },
  });
}

export async function updateProduct(id: string, data: any) {
  return prisma.product.update({
    where: { id },
    data,
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({
    where: { id },
  });
}

export async function getProductsByBusinessId(businessId: string) {
  return prisma.product.findMany({
    where: {
      businessId,
    },
  });
}