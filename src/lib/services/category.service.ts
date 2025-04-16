import { prisma } from '../server/prisma';

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
  });
}

export async function getCategoryByName(name: string) {
  return prisma.category.findUnique({
    where: { name },
  });
}

export async function getCategories(
  params: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
  } = {}
) {
  const { skip, take, where, orderBy } = params;
  return prisma.category.findMany({
    skip,
    take,
    where,
    orderBy,
  });
}

export async function createCategory(data: any) {
  return prisma.category.create({
    data,
  });
}

export async function updateCategory(id: string, data: any) {
  return prisma.category.update({
    where: { id },
    data,
  });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({
    where: { id },
  });
} 