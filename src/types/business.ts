export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  markupPercent: number;
  finalPrice: number;
  stock: number;
  isAvailable: boolean;
  businessId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  universityId: string;
  phoneNumber: string | null;
  role: string;
  totalOrders: number;
  discountTier: string;
}

export interface Business {
  id: string;
  userId: string;
  name: string;
  description: string;
  universityId: string;
  averageRating: number;
  totalRatings: number;
  isVerified: boolean;
  imageUrl: string | null;
  imageFileId: string | null;
  accountNumber: string | null;
  bankName: string | null;
  categories: { id: string; name: string }[];
  subCategories: { id: string; name: string; categoryId: string }[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  productId: string;
  product: Product;
}

export interface Discount {
  id: string;
  userId: string;
  percentage: number;
  isUsed: boolean;
  expiresAt?: Date;
  createdAt: Date;
  usedAt?: Date;
}

export interface OrderGroup {
  id: string;
  userId: string;
  total: number;
  status: string;
  paymentId?: string;
  createdAt: Date;
  shippingName: string;
  shippingHall: string;
  shippingUniversityId: string;
  shippingUniversity?: {
    id: string;
    name: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  businessId: string;
  orderGroupId?: string;
  total: number;
  status: string;
  paymentId?: string;
  paymentReceiptImageUrl?: string;
  paymentReceiptFileId?: string;
  payerAccountName?: string;
  createdAt: Date;
  user: User;
  business: {
    id: string;
    name: string;
    description: string;
  };
  orderGroup?: OrderGroup;
  orderItems: OrderItem[];
  discount?: Discount;
}

// For modal display format
export interface OrderModalData {
  id: string;
  userId: string;
  businessId: string;
  orderGroupId?: string;
  total: number;
  status: string;
  paymentId?: string;
  paymentReceiptImageUrl?: string;
  paymentReceiptFileId?: string;
  payerAccountName?: string;
  createdAt: Date;
  user: User;
  business: {
    id: string;
    name: string;
    description: string;
  };
  orderGroup?: OrderGroup;
  orderItems: OrderItem[];
  discount?: Discount;
} 