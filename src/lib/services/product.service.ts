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

  // Handle additional image uploads if present
  let additionalImages: ProductImage[] = [];
  if (data.images && data.images.length > 0) {
    const uploadedImages = await uploadMultipleImages(data.images);
    additionalImages = uploadedImages.map(img => ({
      url: img.url,
    }));
  }

  // Create product with main image and additional images
  const { images: imageFiles, ...productData } = data;
  return prisma.product.create({
    data: {
      ...productData,
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
    additionalImages = uploadedImages.map(img => ({
      url: img.url,
    }));
  }

  // Update product with new data and images
  const { images: imageFiles, ...updateData } = data;
  return prisma.product.update({
    where: { id },
    data: {
      ...updateData,
      ...(additionalImages.length > 0 && {
        images: {
          deleteMany: {},
          create: additionalImages,
        },
      }),
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

  // Delete product and associated images from database
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