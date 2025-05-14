'use client';

import { formatDistance } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, Package, Clock } from 'lucide-react';

interface OrdersListProps {
  orderGroups: any[];
}

export default function OrdersList({ orderGroups }: OrdersListProps) {
  const router = useRouter();

  if (orderGroups.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
        <p className="mt-2 text-gray-600">Start shopping to place your first order</p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orderGroups.map((orderGroup) => (
        <div key={orderGroup.id} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Order #{orderGroup.id.slice(-8)}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatDistance(new Date(orderGroup.createdAt), new Date(), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary font-medium">
                {orderGroup.status}
              </span>
            </div>
            
            <div className="mt-4">
              <div className="font-medium">Total amount:</div>
              <div className="text-lg font-bold text-primary">₦{orderGroup.total.toFixed(2)}</div>
            </div>
          </div>
          
          <div className="px-6 py-4 border-b bg-gray-50">
            <h4 className="font-medium mb-3">Orders from:</h4>
            <div className="space-y-3">
              {orderGroup.orders.map((order: any) => (
                <div key={order.id} className="flex items-center gap-3">
                  <Store className="h-5 w-5 text-gray-500" />
                  <span>{order.business.name}</span>
                  <span className="text-sm text-gray-600 ml-auto">
                    {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 flex justify-end">
            <Link
              href={`/orders/${orderGroup.id}`}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              View Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
} 