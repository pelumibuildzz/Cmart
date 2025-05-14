import { prisma } from '../server/prisma';

// Category operations
export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      businesses: true,
      products: true,
      subCategories: true
    }
  });
}

export async function getCategoryByName(name: string) {
  return prisma.category.findUnique({
    where: { name },
    include: {
      businesses: true,
      products: true,
      subCategories: true
    }
  });
}

export async function getCategories(
  params: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
    includeRelations?: boolean;
  } = {}
) {
  const { skip, take, where, orderBy, includeRelations = false } = params;
  return prisma.category.findMany({
    skip,
    take,
    where,
    orderBy,
    ...(includeRelations && {
      include: {
        businesses: true,
        products: true,
        subCategories: true
      }
    })
  });
}

export async function createCategory(data: { name: string; isCustom?: boolean }) {
  return prisma.category.create({
    data,
    include: {
      businesses: true,
      products: true,
      subCategories: true
    }
  });
}

export async function updateCategory(id: string, data: { name?: string; isCustom?: boolean }) {
  return prisma.category.update({
    where: { id },
    data,
    include: {
      businesses: true,
      products: true,
      subCategories: true
    }
  });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({
    where: { id },
    include: {
      businesses: true,
      products: true,
      subCategories: true
    }
  });
}

// SubCategory operations
export async function getSubCategoryById(id: string) {
  return prisma.subCategory.findUnique({
    where: { id },
    include: {
      category: true,
      businesses: true,
      products: true
    }
  });
}

export async function getSubCategoryByName(name: string) {
  return prisma.subCategory.findUnique({
    where: { name },
    include: {
      category: true,
      businesses: true,
      products: true
    }
  });
}

export async function getSubCategories(
  params: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
    includeRelations?: boolean;
  } = {}
) {
  const { skip, take, where, orderBy, includeRelations = false } = params;
  return prisma.subCategory.findMany({
    skip,
    take,
    where,
    orderBy,
    ...(includeRelations && {
      include: {
        category: true,
        businesses: true,
        products: true
      }
    })
  });
}

export async function createSubCategory(data: { name: string; categoryId: string }) {
  return prisma.subCategory.create({
    data,
    include: {
      category: true,
      businesses: true,
      products: true
    }
  });
}

export async function updateSubCategory(id: string, data: { name?: string; categoryId?: string }) {
  return prisma.subCategory.update({
    where: { id },
    data,
    include: {
      category: true,
      businesses: true,
      products: true
    }
  });
}

export async function deleteSubCategory(id: string) {
  return prisma.subCategory.delete({
    where: { id },
    include: {
      category: true,
      businesses: true,
      products: true
    }
  });
}

// Get subcategories by category
export async function getSubCategoriesByCategoryId(categoryId: string) {
  return prisma.subCategory.findMany({
    where: { categoryId },
    include: {
      businesses: true,
      products: true
    }
  });
}

// Get businesses by category
export async function getBusinessesByCategoryId(categoryId: string) {
  return prisma.business.findMany({
    where: {
      categories: {
        some: { id: categoryId }
      }
    },
    include: {
      categories: true,
      subCategories: true,
      products: true
    }
  });
}

// Get products by category
export async function getProductsByCategoryId(categoryId: string) {
  return prisma.product.findMany({
    where: {
      categories: {
        some: { id: categoryId }
      }
    },
    include: {
      images: true,
      business: true,
      categories: true,
      subCategories: true
    }
  });
} 