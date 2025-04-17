export interface ProductImage {
  id?: string;
  url: string;
  productId?: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  image: File;  // Main product image
  price: number;
  stock: number;
  businessId: string;
  categoryId: string;
  isAvailable?: boolean;
  images?: File[];  // Additional product images
}

export interface ProductImageUploadResult {
  url: string;
  fileId: string;
} 