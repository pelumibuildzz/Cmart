import { prisma } from '../server/prisma';
import { CreateProductData, ProductImage } from '@/types/product';
import { uploadImage, uploadMultipleImages, deleteImage } from './imagekit.service';

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      Business: true,
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
  return prisma.product.findMany({
    skip,
    take,
    where,
    orderBy,
    include: {
      images: true,
      Business: true,
    },
  });
}

export async function createProduct(data: CreateProductData) {
  const business = await prisma.business.findUnique({ where: { id: data.businessId } });
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!business || !category) {
    throw new Error('Invalid business or category ID');
  }

  // Upload main image
  const mainImageUrl = await uploadImage(
    data.image, 
    `${Date.now()}-${data.image.name}`,
    'products'
  );

  // Handle additional image uploads if present
  let additionalImages: ProductImage[] = [];
  if (data.images && data.images.length > 0) {
    const uploadedImages = await uploadMultipleImages(data.images);
    additionalImages = uploadedImages.map(img => ({
      url: img,
    }));
  }

  // Create product with main image and additional images
  const { image, images: imageFiles, ...productData } = data;
  return prisma.product.create({
    data: {
      ...productData,
      imageUrl: mainImageUrl,
      images: {
        create: additionalImages,
      },
    },
    include: {
      images: true,
      Business: true,
    },
  });
}

export async function updateProduct(id: string, data: Partial<CreateProductData>) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
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

  // Delete old images from ImageKit
  if (product.images.length > 0) {
    const deletePromises = product.images.map((image) =>
      deleteImage(image.id) // Assuming `image.id` is the ImageKit file ID
    );
    await Promise.all(deletePromises);
  }

  // Update product with new data and images
  const { images: imageFiles, ...updateData } = data;
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
    },
    include: {
      images: true,
      Business: true,
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
      Business: true,
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

  // Delete all associated images from ImageKit
  const deletePromises = [
    // Delete main product image
    deleteImage(product.imageUrl),
    // Delete additional images
    ...product.images.map(image => deleteImage(image.id))
  ];
  await Promise.all(deletePromises);

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
      Business: true,
    },
  });
}

export async function removeProductImage(productId: string, imageId: string) {
  const image = await prisma.productImage.findFirst({
    where: {
      id: imageId,
      productId: productId,
    },
  });

  if (!image) {
    throw new Error('Image not found');
  }

  await deleteImage(imageId);
  return prisma.productImage.delete({
    where: { id: imageId },
  });
}