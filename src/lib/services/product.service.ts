import { prisma } from '../server/prisma';
import { CreateProductData, ProductImage } from '@/types/product';
import { uploadImage, uploadMultipleImages, deleteImage } from './imagekit.service';

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      business: true,
      categories: true,
      subCategories: true
    },
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
  
  // Create a base where condition that includes filtering for verified businesses
  // but allows explicit overrides if provided in the where parameter
  const baseWhere = {
    business: {
      isVerified: true
    },
    ...where
  };
  
  return prisma.product.findMany({
    skip,
    take,
    where: baseWhere,
    orderBy,
    include: {
      images: true,
      business: true,
      categories: true,
      subCategories: true
    },
  });
}

export async function createProduct(data: CreateProductData) {
  try {
    const business = await prisma.business.findUnique({ 
      where: { id: data.businessId },
      include: { user: true }
    });
    
    if (!business) {
      throw new Error('Business not found');
    }

    // Check if categories exist
    if (data.categoryIds && data.categoryIds.length > 0) {
      const categories = await prisma.category.findMany({
        where: { id: { in: data.categoryIds } }
      });
      
      if (categories.length !== data.categoryIds.length) {
        throw new Error('One or more category IDs are invalid');
      }
    }

    // Check if subcategories exist
    if (data.subCategoryIds && data.subCategoryIds.length > 0) {
      const subCategories = await prisma.subCategory.findMany({
        where: { id: { in: data.subCategoryIds } }
      });
      
      if (subCategories.length !== data.subCategoryIds.length) {
        throw new Error('One or more subcategory IDs are invalid');
      }
    }

    // Upload main image
    let mainImageUrl: string;
    try {
      mainImageUrl = await uploadImage(
        data.image, 
        `${Date.now()}-${data.image.name}`,
        'products'
      );
    } catch (error) {
      console.error('Error uploading main image:', error);
      throw new Error('Failed to upload main image');
    }

    // Handle additional image uploads if present
    let additionalImages: { url: string }[] = [];
    if (data.images && data.images.length > 0) {
      try {
        const uploadedImages = await uploadMultipleImages(data.images);
        additionalImages = uploadedImages.map(url => ({
          url,
        }));
      } catch (error) {
        console.error('Error uploading additional images:', error);
        // Don't fail the whole operation if additional images fail
      }
    }

    // Create product with main image and additional images
    const { categoryIds, subCategoryIds, ...productData } = data;
    return await prisma.product.create({
      data: {
        ...productData,
        finalPrice: productData.finalPrice || 0, 
        imageUrl: mainImageUrl,
        images: {
          create: additionalImages,
        },
        ...(categoryIds && categoryIds.length > 0 && {
          categories: {
            connect: categoryIds.map(id => ({ id }))
          }
        }),
        ...(subCategoryIds && subCategoryIds.length > 0 && {
          subCategories: {
            connect: subCategoryIds.map(id => ({ id }))
          }
        })
      },
      include: {
        images: true,
        categories: true,
        subCategories: true,
        business: {
          include: {
            user: true
          }
        },
      },
    });
  } catch (error) {
    console.error('Error in createProduct:', error);
    throw error;
  }
}

export async function updateProduct(id: string, data: Partial<CreateProductData>) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { 
      images: true,
      categories: true,
      subCategories: true
    },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Handle additional image uploads if present
  let additionalImages: ProductImage[] = [];
  if (data.images && data.images.length > 0) {
    // Upload new images
    const uploadedImages = await uploadMultipleImages(data.images);
    additionalImages = uploadedImages.map((url) => ({
      url, // Map the uploaded image URLs correctly
    }));
  }

  // Delete old images from ImageKit if we have new images to replace them
  if (additionalImages.length > 0 && product.images.length > 0) {
    try {
      // Extract the file IDs from the image URLs
      // ImageKit URLs typically look like: https://ik.imagekit.io/your_imagekit_id/filename
      // The file ID is the part after the last slash
      const deletePromises = product.images.map((image) => {
        const urlParts = image.url.split('/');
        const fileId = urlParts[urlParts.length - 1];
        return deleteImage(fileId);
      });
      
      // Use Promise.allSettled to continue even if some deletions fail
      await Promise.allSettled(deletePromises);
    } catch (error) {
      console.error('Error deleting old images:', error);
      // Continue with the update even if image deletion fails
    }
  }

  // Prepare update data
  const { images, categoryIds, subCategoryIds, ...updateData } = data;
  
  // Prepare categories update if needed
  const categoryUpdates = categoryIds ? {
    categories: {
      set: categoryIds.map(id => ({ id }))
    }
  } : {};

  // Prepare subcategories update if needed
  const subCategoryUpdates = subCategoryIds ? {
    subCategories: {
      set: subCategoryIds.map(id => ({ id }))
    }
  } : {};

  // Update product with new data, images, and category relationships
  return prisma.product.update({
    where: { id },
    data: {
      ...updateData,
      ...(additionalImages.length > 0 && {
        images: {
          deleteMany: {}, // Clear old images from the database
          create: additionalImages, // Add new images
        },
      }),
      ...categoryUpdates,
      ...subCategoryUpdates
    },
    include: {
      images: true,
      business: true,
      categories: true,
      subCategories: true
    },
  });
}

export async function updateProductMainImage(productId: string, newImage: File) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const newImageUrl = await uploadImage(
    newImage,
    `${Date.now()}-${newImage.name}`,
    'products'
  );

  return prisma.product.update({
    where: { id: productId },
    data: {
      imageUrl: newImageUrl,
    },
    include: {
      images: true,
      business: true,
      categories: true,
      subCategories: true
    },
  });
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  try {
    // Extract file IDs from image URLs
    const deletePromises = [];
    
    // Handle main image if it exists
    if (product.imageUrl) {
      const mainUrlParts = product.imageUrl.split('/');
      const mainFileId = mainUrlParts[mainUrlParts.length - 1];
      deletePromises.push(deleteImage(mainFileId));
    }
    
    // Handle additional images
    product.images.forEach(image => {
      const urlParts = image.url.split('/');
      const fileId = urlParts[urlParts.length - 1];
      deletePromises.push(deleteImage(fileId));
    });
    
    // Use Promise.allSettled to continue even if some deletions fail
    await Promise.allSettled(deletePromises);
  } catch (error) {
    console.error('Error deleting images:', error);
    // Continue with product deletion even if image deletion fails
  }

  return prisma.product.delete({
    where: { id },
  });
}

export async function getProductsByBusinessId(businessId: string) {
  return prisma.product.findMany({
    where: {
      businessId,
    },
    include: {
      images: true,
      categories: true,
      subCategories: true
    },
  });
}

export async function addProductImages(productId: string, images: File[]) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: true },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const uploadedImages = await uploadMultipleImages(images);
  const imageData = uploadedImages.map(url => ({
    url,
    productId,
  }));

  return prisma.product.update({
    where: { id: productId },
    data: {
      images: {
        create: imageData,
      },
    },
    include: {
      images: true,
      business: true,
      categories: true,
      subCategories: true
    },
  });
}

export async function removeProductImage(productId: string, imageId: string) {
  const image = await prisma.productImage.findFirst({
    where: {
      id: imageId,
      productId,
    },
  });

  if (!image) {
    throw new Error('Image not found');
  }

  try {
    // Extract the file ID from the image URL
    const urlParts = image.url.split('/');
    const fileId = urlParts[urlParts.length - 1];
    
    // Delete image from ImageKit
    await deleteImage(fileId);
  } catch (error) {
    console.error('Error deleting image from ImageKit:', error);
    // Continue with database deletion even if ImageKit deletion fails
  }

  // Delete from database
  await prisma.productImage.delete({
    where: {
      id: imageId,
    },
  });

  return getProductById(productId);
}

// New helper functions for category management

export async function addProductCategories(productId: string, categoryIds: string[]) {
  return prisma.product.update({
    where: { id: productId },
    data: {
      categories: {
        connect: categoryIds.map(id => ({ id }))
      }
    },
    include: {
      categories: true,
      subCategories: true
    }
  });
}

export async function removeProductCategories(productId: string, categoryIds: string[]) {
  return prisma.product.update({
    where: { id: productId },
    data: {
      categories: {
        disconnect: categoryIds.map(id => ({ id }))
      }
    },
    include: {
      categories: true,
      subCategories: true
    }
  });
}

export async function addProductSubCategories(productId: string, subCategoryIds: string[]) {
  return prisma.product.update({
    where: { id: productId },
    data: {
      subCategories: {
        connect: subCategoryIds.map(id => ({ id }))
      }
    },
    include: {
      categories: true,
      subCategories: true
    }
  });
}

export async function removeProductSubCategories(productId: string, subCategoryIds: string[]) {
  return prisma.product.update({
    where: { id: productId },
    data: {
      subCategories: {
        disconnect: subCategoryIds.map(id => ({ id }))
      }
    },
    include: {
      categories: true,
      subCategories: true
    }
  });
}

export async function getProductsByCategory(categoryId: string) {
  return prisma.product.findMany({
    where: {
      categories: {
        some: { id: categoryId }
      },
      isAvailable: true,
      business: {
        isVerified: true
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

export async function getProductsBySubCategory(subCategoryId: string) {
  return prisma.product.findMany({
    where: {
      subCategories: {
        some: { id: subCategoryId }
      },
      isAvailable: true,
      business: {
        isVerified: true
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

export async function updateProductStock(productId: string, quantity: number) {
  return prisma.product.update({
    where: { id: productId },
    data: {
      stock: {
        decrement: quantity
      }
    }
  });
}