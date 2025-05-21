export interface ProductImage {
  id: string;
  url: string;
  fileId?: string;
  productId: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  image: File;  // Main product image
  basePrice: number;
  markupPercent?: number;
  finalPrice?: number;
  stock: number;
  businessId: string;
  categoryIds: string[];  // Multiple categories
  subCategoryIds?: string[]; // Optional subcategories
  isAvailable?: boolean;
  images?: File[];  // Additional product images
  videos?: File[];  // Product videos
}

export interface ProductImageUploadResult {
  url: string;
  fileId: string;
}

export interface Category {
  id: string;
  name: string;
  isCustom?: boolean;
}

export interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
  category?: Category;
}

export interface ProductVideo {
  id: string;
  url: string;
  fileId?: string;
  thumbnailUrl?: string;
  productId: string;
} 