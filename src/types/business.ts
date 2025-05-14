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
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  productId: string;
  product: Product;
}

export interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: Date;
  user: User;
  business: {
    id: string;
    name: string;
    description: string;
  };
  orderItems: OrderItem[];
}

// For modal display format
export interface OrderModalItem {
  id: string;
  quantity: number;
  price: number;
  productId: string;
  Product: Product;
}

export interface OrderModalData {
  id: string;
  status: string;
  total: number;
  createdAt: Date;
  User: User;
  Business: {
    id: string;
    name: string;
    description: string;
  };
  OrderItems: OrderModalItem[];
} 