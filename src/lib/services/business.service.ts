import { prisma } from '../server/prisma';
import { uploadImage, deleteImage } from './imagekit.service';

interface CreateBusinessData {
  userId: string;
  name: string;
  description: string;
  universityId: string;
  bankName?: string;       // Optional bank name 
  accountNumber?: string;  // Optional account number
  categoryIds: string[];   // Now accepts multiple categories
  subCategoryIds?: string[]; // Optional subcategories
  image?: File;            // Optional business profile image
}

interface CreateBusinessWithoutImageUploadData {
  userId: string;
  name: string;
  description: string;
  universityId: string;
    bankName?: string;       // Optional bank name 
  accountNumber?: string;  // Optional account number
  categoryIds: string[];   // Now accepts multiple categories
  subCategoryIds?: string[]; // Optional subcategories
  imageUrl?: string;       // Pre-uploaded image URL
  imageFileId?: string;    // Pre-uploaded image file ID
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

  // Upload image if provided
  let imageUrl: string | undefined;
  let imageFileId: string | undefined;
  
  if (data.image) {
    try {
      // Create safe version of the image to avoid serialization issues
      const safeImage = {
        name: data.image.name,
        size: data.image.size,
        type: data.image.type,
        lastModified: data.image.lastModified,
        arrayBuffer: data.image.arrayBuffer.bind(data.image),
        slice: data.image.slice.bind(data.image),
        stream: data.image.stream?.bind(data.image),
        text: data.image.text?.bind(data.image),
      };
      
      const uploadResult = await uploadImage(
        safeImage as File,
        `${Date.now()}-${safeImage.name}`,
        'businesses'
      );
      
      imageUrl = uploadResult.url;
      imageFileId = uploadResult.fileId;
    } catch (error) {
      console.error('Error uploading business image:', error);
      // Continue with business creation even if image upload fails
    }
  }

  return prisma.business.create({
    data: {
      name: data.name,
      description: data.description,
      universityId: data.universityId,
      userId: data.userId,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      imageUrl: imageUrl,
      imageFileId: imageFileId,
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

export async function createBusinessWithoutImageUpload(data: CreateBusinessWithoutImageUploadData) {
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
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      imageUrl: data.imageUrl,
      imageFileId: data.imageFileId,
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

  // Handle image upload if provided
  if (data.image) {
    delete updateData.image; // Remove from regular update data

    // Get the current business for potential image deletion
    const business = await prisma.business.findUnique({
      where: { id },
      select: { imageFileId: true }
    });

    // Delete existing image if fileId exists
    if (business?.imageFileId) {
      try {
        await deleteImage(business.imageFileId);
      } catch (error) {
        console.error('Error deleting existing business image:', error);
        // Continue with update even if image deletion fails
      }
    }

    try {
      // Create safe version of the image to avoid serialization issues
      const safeImage = {
        name: data.image.name,
        size: data.image.size,
        type: data.image.type,
        lastModified: data.image.lastModified,
        arrayBuffer: data.image.arrayBuffer.bind(data.image),
        slice: data.image.slice.bind(data.image),
        stream: data.image.stream?.bind(data.image),
        text: data.image.text?.bind(data.image),
      };
      
      const uploadResult = await uploadImage(
        safeImage as File,
        `${Date.now()}-${safeImage.name}`,
        'businesses'
      );
      
      updateData.imageUrl = uploadResult.url;
      updateData.imageFileId = uploadResult.fileId;
    } catch (error) {
      console.error('Error uploading business image:', error);
      // Continue with update even if image upload fails
    }
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

export async function updateBusinessImage(businessId: string, image: File) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!business) {
    throw new Error('Business not found');
  }

  // Delete existing image if fileId exists
  if (business.imageFileId) {
    try {
      await deleteImage(business.imageFileId);
    } catch (error) {
      console.error('Error deleting existing business image:', error);
      // Continue with update even if image deletion fails
    }
  }

  // Create a safe image object to avoid serialization issues
  const safeImage = {
    name: image.name,
    size: image.size,
    type: image.type,
    lastModified: image.lastModified,
    arrayBuffer: image.arrayBuffer.bind(image),
    slice: image.slice.bind(image),
    stream: image.stream?.bind(image),
    text: image.text?.bind(image),
  };

  const uploadResult = await uploadImage(
    safeImage as File,
    `${Date.now()}-${safeImage.name}`,
    'businesses'
  );

  return prisma.business.update({
    where: { id: businessId },
    data: {
      imageUrl: uploadResult.url,
      imageFileId: uploadResult.fileId
    },
    include: {
      products: true,
      categories: true,
      subCategories: true,
      user: true
    }
  });
}