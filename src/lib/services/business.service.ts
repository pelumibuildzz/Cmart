import { prisma } from '../server/prisma';

interface CreateBusinessData {
  userId: string;
  name: string;
  description: string;
  universityId: string;
  categoryIds: string[];  // Now accepts multiple categories
  subCategoryIds?: string[]; // Optional subcategories
}

export async function getBusinessById(id: string, ownerId?: string) {
  try {
    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        products: {
          where: ownerId ? {} : { isAvailable: true }, // Only include available products if not the owner
          include: {
            images: true,
            categories: true,
            subCategories: true
          }
        },
        categories: true,
        subCategories: true,
        user: true
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
      products: {
        include: {
          images: true,
          categories: true,
          subCategories: true
        }
      },
      categories: true,
      subCategories: true,
      user: true
    }
  });
}

export async function getBusinesses(
  params: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
    include?: any;
  } = {}
) {
  const { skip, take, where, orderBy, include } = params;
  
  // Default includes
  const defaultIncludes = {
    products: true,
    user: true,    
    categories: true,
    subCategories: true,
    orders: true   
  };
  
  // Merge default includes with any custom includes
  const includeParams = include ? { ...defaultIncludes, ...include } : defaultIncludes;
  
  return prisma.business.findMany({
    skip,
    take,
    where,
    orderBy,
    include: includeParams
  });
}

export async function createBusiness(data: CreateBusinessData) {
  // Validate categories exist
  const categories = await prisma.category.findMany({
    where: {
      id: { in: data.categoryIds }
    }
  });

  if (categories.length !== data.categoryIds.length) {
    throw new Error('One or more category IDs are invalid');
  }

  // Validate subcategories if provided
  let subCategories = [];
  if (data.subCategoryIds && data.subCategoryIds.length > 0) {
    subCategories = await prisma.subCategory.findMany({
      where: {
        id: { in: data.subCategoryIds }
      }
    });

    if (subCategories.length !== data.subCategoryIds.length) {
      throw new Error('One or more subcategory IDs are invalid');
    }
  }

  return prisma.business.create({
    data: {
      name: data.name,
      description: data.description,
      universityId: data.universityId,
      userId: data.userId,
      isVerified: false,
      categories: {
        connect: data.categoryIds.map(id => ({ id }))
      },
      ...(data.subCategoryIds && data.subCategoryIds.length > 0 && {
        subCategories: {
          connect: data.subCategoryIds.map(id => ({ id }))
        }
      })
    },
    include: {
      categories: true,
      subCategories: true,
      products: true,
      user: true
    },
  });
}

export async function updateBusiness(id: string, data: Partial<CreateBusinessData> & { [key: string]: any }) {
  const updateData: any = { ...data };
  
  // Handle category connections/disconnections if categoryIds are provided
  if (data.categoryIds) {
    delete updateData.categoryIds; // Remove from regular update data
    
    // Get current categories
    const business = await prisma.business.findUnique({
      where: { id },
      include: { categories: true }
    });
    
    if (!business) throw new Error('Business not found');
    
    // Set up the categories connection
    updateData.categories = {
      set: data.categoryIds.map(id => ({ id }))
    };
  }
  
  // Handle subcategory connections/disconnections if subCategoryIds are provided
  if (data.subCategoryIds) {
    delete updateData.subCategoryIds; // Remove from regular update data
    
    // Set up the subcategories connection
    updateData.subCategories = {
      set: data.subCategoryIds.map(id => ({ id }))
    };
  }

  return prisma.business.update({
    where: { id },
    data: updateData,
    include: {
      products: true,
      categories: true,
      subCategories: true,
      user: true
    }
  });
}

export async function deleteBusiness(id: string) {
  return prisma.business.delete({
    where: { id },
    include: {
      products: true,
      categories: true,
      subCategories: true
    }
  });
}

// New helper functions for category management

export async function addBusinessCategories(businessId: string, categoryIds: string[]) {
  return prisma.business.update({
    where: { id: businessId },
    data: {
      categories: {
        connect: categoryIds.map(id => ({ id }))
      }
    },
    include: {
      categories: true
    }
  });
}

export async function removeBusinessCategories(businessId: string, categoryIds: string[]) {
  return prisma.business.update({
    where: { id: businessId },
    data: {
      categories: {
        disconnect: categoryIds.map(id => ({ id }))
      }
    },
    include: {
      categories: true
    }
  });
}

export async function addBusinessSubCategories(businessId: string, subCategoryIds: string[]) {
  return prisma.business.update({
    where: { id: businessId },
    data: {
      subCategories: {
        connect: subCategoryIds.map(id => ({ id }))
      }
    },
    include: {
      subCategories: true
    }
  });
}

export async function removeBusinessSubCategories(businessId: string, subCategoryIds: string[]) {
  return prisma.business.update({
    where: { id: businessId },
    data: {
      subCategories: {
        disconnect: subCategoryIds.map(id => ({ id }))
      }
    },
    include: {
      subCategories: true
    }
  });
}