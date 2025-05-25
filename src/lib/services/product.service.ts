import { prisma } from '../server/prisma';
import { CreateProductData, ProductImage, ProductVideo } from '@/types/product';
import { uploadImage, uploadMultipleImages, deleteImage, uploadVideo, uploadMultipleVideos } from './imagekit.service';

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      videos: true,
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
    let mainImageFileId: string;
    try {
      // Extract only necessary properties from the image File object
      // to avoid serialization issues with function properties
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
        'products'
      );
      
      mainImageUrl = uploadResult.url;
      mainImageFileId = uploadResult.fileId;
    } catch (error) {
      console.error('Error uploading main image:', error);
      throw new Error('Failed to upload main image');
    }

    // Handle additional image uploads if present
    let additionalImages: { url: string; fileId: string }[] = [];
    if (data.images && data.images.length > 0) {
      try {
        // Create safe versions of each image to avoid serialization issues
        const safeImages = data.images.map(img => ({
          name: img.name,
          size: img.size,
          type: img.type,
          lastModified: img.lastModified,
          arrayBuffer: img.arrayBuffer.bind(img),
          slice: img.slice.bind(img),
          stream: img.stream?.bind(img),
          text: img.text?.bind(img),
        }));
        
        const uploadedImages = await uploadMultipleImages(safeImages as File[]);
        additionalImages = uploadedImages;
      } catch (error) {
        console.error('Error uploading additional images:', error);
        // Don't fail the whole operation if additional images fail
      }
    }

    // Handle video uploads if present
    let productVideos: { url: string; fileId: string }[] = [];
    if (data.videos && data.videos.length > 0) {
      try {
        // Create safe versions of each video to avoid serialization issues
        const safeVideos = data.videos.map(video => ({
          name: video.name,
          size: video.size,
          type: video.type,
          lastModified: video.lastModified,
          arrayBuffer: video.arrayBuffer.bind(video),
          slice: video.slice.bind(video),
          stream: video.stream?.bind(video),
          text: video.text?.bind(video),
        }));
        
        const uploadedVideos = await uploadMultipleVideos(safeVideos as File[]);
        productVideos = uploadedVideos;
      } catch (error) {
        console.error('Error uploading videos:', error);
        // Don't fail the whole operation if videos fail
      }
    }

    // Create product with main image, additional images, and videos
    // Extract only serializable data and avoid including any functions
    const { categoryIds, subCategoryIds, image, images, videos, ...productData } = data;
    
    return await prisma.product.create({
      data: {
        ...productData,
        finalPrice: productData.finalPrice || 0, 
        imageUrl: mainImageUrl,
        images: {
          create: additionalImages.map(img => ({
            url: img.url,
            fileId: img.fileId
          })),
        },
        videos: {
          create: productVideos.map(video => ({
            url: video.url,
            fileId: video.fileId
          })),
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
        videos: true,
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
      videos: true,
      categories: true,
      subCategories: true
    },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Handle additional image uploads if present
  let additionalImages: { url: string; fileId: string }[] = [];
  if (data.images && data.images.length > 0) {
    try {
      // Create safe versions of each image to avoid serialization issues
      const safeImages = data.images.map(img => ({
        name: img.name,
        size: img.size,
        type: img.type,
        lastModified: img.lastModified,
        arrayBuffer: img.arrayBuffer.bind(img),
        slice: img.slice.bind(img),
        stream: img.stream?.bind(img),
        text: img.text?.bind(img),
      }));
      
      // Upload all images
      const uploadedImages = await uploadMultipleImages(safeImages as File[]);
      
      // Create image records (not persisted yet, just for the Prisma query)
      additionalImages = uploadedImages;
    } catch (error) {
      console.error('Error uploading additional images:', error);
      // Don't fail the whole operation if additional images fail
    }
  }

  // Handle video uploads if present
  let productVideos: { url: string; fileId: string }[] = [];
  if (data.videos && data.videos.length > 0) {
    try {
      // Create safe versions of each video to avoid serialization issues
      const safeVideos = data.videos.map(video => ({
        name: video.name,
        size: video.size,
        type: video.type,
        lastModified: video.lastModified,
        arrayBuffer: video.arrayBuffer.bind(video),
        slice: video.slice.bind(video),
        stream: video.stream?.bind(video),
        text: video.text?.bind(video),
      }));

      // Upload all videos
      const uploadedVideos = await uploadMultipleVideos(safeVideos as File[]);
      
      // Create video records (not persisted yet, just for the Prisma query)
      productVideos = uploadedVideos;
    } catch (error) {
      console.error('Error uploading videos:', error);
      // Don't fail the whole operation if videos fail
    }
  }

  // Delete old images from ImageKit if we have new images to replace them
  if (additionalImages.length > 0 && product.images.length > 0) {
    try {
      // Delete the old images from ImageKit using the stored fileIds
      const deletePromises: Promise<void>[] = product.images
        .filter(image => image.fileId) // Only process images with fileId
        .map(image => deleteImage(image.fileId!));
      
      // Use Promise.allSettled to continue even if some deletions fail
      if (deletePromises.length > 0) {
      await Promise.allSettled(deletePromises);
      }
    } catch (error) {
      console.error('Error deleting old images:', error);
      // Continue with the update even if image deletion fails
    }
  }

  // Delete old videos from ImageKit if we have new videos to replace them
  if (productVideos.length > 0 && product.videos.length > 0) {
    try {
      // Delete the old videos from ImageKit using the stored fileIds
      const deletePromises: Promise<void>[] = product.videos
        .filter(video => video.fileId) // Only process videos with fileId
        .map(video => deleteImage(video.fileId!));
      
      // Use Promise.allSettled to continue even if some deletions fail
      if (deletePromises.length > 0) {
        await Promise.allSettled(deletePromises);
      }
    } catch (error) {
      console.error('Error deleting old videos:', error);
      // Continue with the update even if video deletion fails
    }
  }

  // Handle main image update if present
  let mainImageUrl;
  let mainImageFileId;
  if (data.image) {
    try {
      // Create a safe image object to avoid serialization issues
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
        'products'
      );
      
      mainImageUrl = uploadResult.url;
      mainImageFileId = uploadResult.fileId;
    } catch (error) {
      console.error('Error uploading main image:', error);
      // Continue with the update even if main image upload fails
    }
  }

  // Prepare update data - remove all non-serializable elements
  const { images, image, videos, categoryIds, subCategoryIds, ...updateData } = data;
  
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
      ...(mainImageUrl && { imageUrl: mainImageUrl }),
      ...(additionalImages.length > 0 && {
        images: {
          deleteMany: {}, // Clear old images from the database
          create: additionalImages.map(img => ({
            url: img.url,
            fileId: img.fileId
          })),
        },
      }),
      ...(productVideos.length > 0 && {
        videos: {
          deleteMany: {}, // Clear old videos from the database
          create: productVideos.map(video => ({
            url: video.url,
            fileId: video.fileId
          })),
        },
      }),
      ...categoryUpdates,
      ...subCategoryUpdates
    },
    include: {
      images: true,
      videos: true,
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

  // Create a safe image object to avoid serialization issues
  const safeImage = {
    name: newImage.name,
    size: newImage.size,
    type: newImage.type,
    lastModified: newImage.lastModified,
    arrayBuffer: newImage.arrayBuffer.bind(newImage),
    slice: newImage.slice.bind(newImage),
    stream: newImage.stream?.bind(newImage),
    text: newImage.text?.bind(newImage),
  };

  const uploadResult = await uploadImage(
    safeImage as File,
    `${Date.now()}-${safeImage.name}`,
    'products'
  );

  return prisma.product.update({
    where: { id: productId },
    data: {
      imageUrl: uploadResult.url,
    },
    include: {
      images: true,
      videos: true,
      business: true,
      categories: true,
      subCategories: true
    },
  });
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { 
      images: true,
      videos: true
    },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  try {
    const deletePromises: Promise<void>[] = [];
    
    // Delete all product images from ImageKit using their fileIds
    product.images
      .filter(image => image.fileId) // Only process images with fileId
      .forEach(image => {
        deletePromises.push(deleteImage(image.fileId!));
      });

    // Delete all product videos from ImageKit using their fileIds
    product.videos
      .filter(video => video.fileId) // Only process videos with fileId
      .forEach(video => {
        deletePromises.push(deleteImage(video.fileId!));
    });
    
    // Use Promise.allSettled to continue even if some deletions fail
    if (deletePromises.length > 0) {
    await Promise.allSettled(deletePromises);
    }
  } catch (error) {
    console.error('Error deleting media files:', error);
    // Continue with product deletion even if media deletion fails
  }

  // Handle cascading deletion to avoid foreign key constraint errors
  // First, delete all associated images
  if (product.images.length > 0) {
    await prisma.productImage.deleteMany({
      where: { productId: id }
    });
  }

  // Then, delete all associated videos
  if (product.videos.length > 0) {
    await prisma.productVideo.deleteMany({
      where: { productId: id }
    });
  }

  // Finally, delete the product itself
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

  // Create safe versions of each image to avoid serialization issues
  const safeImages = images.map(img => ({
    name: img.name,
    size: img.size,
    type: img.type,
    lastModified: img.lastModified,
    arrayBuffer: img.arrayBuffer.bind(img),
    slice: img.slice.bind(img),
    stream: img.stream?.bind(img),
    text: img.text?.bind(img),
  }));

  const uploadResults = await uploadMultipleImages(safeImages as File[]);
  const imageData = uploadResults.map(result => ({
    url: result.url,
    fileId: result.fileId,
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
      videos: true,
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
    // Delete image from ImageKit using the fileId if it exists
    if (image.fileId) {
      await deleteImage(image.fileId);
    }
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

// Add new function to handle adding videos to a product
export async function addProductVideos(productId: string, videos: File[]) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { videos: true },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Create safe versions of each video to avoid serialization issues
  const safeVideos = videos.map(video => ({
    name: video.name,
    size: video.size,
    type: video.type,
    lastModified: video.lastModified,
    arrayBuffer: video.arrayBuffer.bind(video),
    slice: video.slice.bind(video),
    stream: video.stream?.bind(video),
    text: video.text?.bind(video),
  }));

  const uploadResults = await uploadMultipleVideos(safeVideos as File[]);
  const videoData = uploadResults.map(result => ({
    url: result.url,
    fileId: result.fileId,
    productId,
  }));

  return prisma.product.update({
    where: { id: productId },
    data: {
      videos: {
        create: videoData,
      },
    },
    include: {
      images: true,
      videos: true,
      business: true,
      categories: true,
      subCategories: true
    },
  });
}

// Add new function to remove a video from a product
export async function removeProductVideo(productId: string, videoId: string) {
  const video = await prisma.productVideo.findFirst({
    where: { 
      id: videoId,
      productId 
    }
  });

  if (!video) {
    throw new Error('Video not found or does not belong to this product');
  }

  try {
    // Delete video from ImageKit using the fileId if it exists
    if (video.fileId) {
      await deleteImage(video.fileId);
    }
  } catch (error) {
    console.error('Error deleting video from ImageKit:', error);
    // Continue with database deletion even if ImageKit deletion fails
  }

  // Delete from database
  await prisma.productVideo.delete({
    where: { id: videoId }
  });

  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: true,
      videos: true,
      business: true,
      categories: true,
      subCategories: true
    },
  });
}

export async function getRelatedProducts(productId: string) {
  // First, get the current product to analyze its attributes
  const currentProduct = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      categories: true,
      subCategories: true,
      business: true
    }
  });

  if (!currentProduct) {
    return [];
  }

  // Calculate price range (±20%)
  const priceMin = currentProduct.finalPrice * 0.8;
  const priceMax = currentProduct.finalPrice * 1.2;

  // Get category and subcategory IDs for matching
  const categoryIds = currentProduct.categories.map(cat => cat.id);
  const subCategoryIds = currentProduct.subCategories.map(subCat => subCat.id);

  // Build complex query to find related products using hybrid approach
  const relatedProducts = await prisma.product.findMany({
    where: {
      AND: [
        { id: { not: productId } }, // Exclude current product
        { isAvailable: true }, // Only available products
        { 
          business: { 
            isVerified: true // Only from verified businesses
          } 
        },
        {
          OR: [
            // Match by categories
            categoryIds.length > 0 ? {
              categories: {
                some: {
                  id: { in: categoryIds }
                }
              }
            } : {},
            // Match by subcategories
            subCategoryIds.length > 0 ? {
              subCategories: {
                some: {
                  id: { in: subCategoryIds }
                }
              }
            } : {},
            // Match by similar price range
            {
              finalPrice: {
                gte: priceMin,
                lte: priceMax
              }
            }
          ].filter(condition => Object.keys(condition).length > 0) // Remove empty conditions
        }
      ]
    },
    include: {
      images: true,
      business: true,
      categories: true,
      subCategories: true
    },
    take: 8, // Get more than needed for better scoring
  });

  // Score products based on multiple factors
  const scoredProducts = relatedProducts.map(product => {
    let score = 0;
    
    // Category match (highest priority)
    const matchingCategories = product.categories.filter(cat => 
      categoryIds.includes(cat.id)
    ).length;
    score += matchingCategories * 10;
    
    // Subcategory match (high priority)
    const matchingSubCategories = product.subCategories.filter(subCat => 
      subCategoryIds.includes(subCat.id)
    ).length;
    score += matchingSubCategories * 8;
    
    // Price similarity (medium priority)
    const priceDifference = Math.abs(product.finalPrice - currentProduct.finalPrice);
    const maxPriceDifference = currentProduct.finalPrice * 0.2; // 20% range
    if (priceDifference <= maxPriceDifference) {
      score += (1 - (priceDifference / maxPriceDifference)) * 5;
    }
    
    // Same business (low priority bonus)
    if (product.businessId === currentProduct.businessId) {
      score += 2;
    }
    
    // Stock availability bonus
    if (product.stock > 0) {
      score += 1;
    }

    return {
      ...product,
      score
    };
  });

  // Sort by score and return top 4
  return scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ score, ...product }) => product); // Remove score from final result
}