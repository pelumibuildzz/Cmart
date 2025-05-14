'use client';

import { cn } from '@/lib/utils';
import { OrderStatus } from '@/lib/constants/order';

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export default function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case OrderStatus.UNVERIFIED:
        return 'bg-orange-100 text-orange-800';
      case OrderStatus.PENDING:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.PACKAGING:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.DELIVERING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        getStatusColor(status),
        className
      )}
    >
      {status}
    </span>
  );
} 