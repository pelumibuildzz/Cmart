export const OrderStatus = {
  UNVERIFIED: 'UNVERIFIED',
  PENDING: 'PENDING',
  PACKAGING: 'PACKAGING',
  DELIVERING: 'DELIVERING',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

export const OrderStatusColors = {
  [OrderStatus.UNVERIFIED]: 'bg-orange-100 text-orange-800',
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.PACKAGING]: 'bg-blue-100 text-blue-800',
  [OrderStatus.DELIVERING]: 'bg-purple-100 text-purple-800',
  [OrderStatus.DELIVERED]: 'bg-indigo-100 text-indigo-800',
  [OrderStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
} as const; 