'use client';

import Modal from './ui/Modal';
import Image from 'next/image';
import { OrderStatus, OrderStatusColors } from '@/lib/constants/order';
import { formatDate } from '@/lib/utils/date';
import { formatPrice } from '@/lib/utils/format';
import { OrderModalData } from '@/types/business';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderModalData | null;
  onUpdateStatus?: (orderId: string, status: string) => Promise<void>;
  readOnly?: boolean;
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
  readOnly = false,
}: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Order Details - ${order.id.slice(0, 8)}`}>
      <div className="space-y-6">
        {/* Customer Information */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-900">{order.user.name}</p>
            <p className="text-sm text-gray-500">{order.user.email}</p>
          </div>
        </div>

        {/* Payment Receipt (if available) */}
        {order.status === OrderStatus.UNVERIFIED && order.paymentReceiptImageUrl && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Receipt</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-900 mb-2">
                Payer: {order.payerAccountName || 'Not provided'}
              </p>
              <div className="mt-2">
                <a 
                  href={order.paymentReceiptImageUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  View Receipt Image
                </a>
                <div className="mt-3">
                  <Image 
                    src={order.paymentReceiptImageUrl} 
                    alt="Payment Receipt" 
                    className="max-w-full h-auto max-h-60 rounded-md"
                    width={300}
                    height={300}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Business Information */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Business Information</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-900">{order.business.name}</p>
            <p className="text-sm text-gray-500">{order.business.description}</p>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Order Items</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="pb-2">Item</th>
                  <th className="pb-2">Quantity</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.orderItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2">
                      <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                    </td>
                    <td className="py-2">
                      <p className="text-sm text-gray-500">{item.quantity}</p>
                    </td>
                    <td className="py-2">
                      <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                    </td>
                    <td className="py-2">
                      <p className="text-sm text-gray-500">{formatPrice(item.price * item.quantity)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="pt-4 text-right text-sm font-medium text-gray-500">Total:</td>
                  <td className="pt-4 text-sm font-medium text-gray-900">{formatPrice(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Order Group Information (if available) */}
        {order.orderGroup && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Order Group</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900">ID: {order.orderGroup.id.slice(0, 8)}</p>
              <p className="text-sm text-gray-500">Created: {formatDate(order.orderGroup.createdAt)}</p>
              <p className="text-sm text-gray-500">Status: {order.orderGroup.status}</p>
              <p className="text-sm text-gray-500">Total: {formatPrice(order.orderGroup.total)}</p>
            </div>
          </div>
        )}

        {/* Discount Information (if available) */}
        {order.discount && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Discount Applied</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900">{order.discount.percentage}% off</p>
              {order.discount.expiresAt && (
                <p className="text-sm text-gray-500">Expires: {formatDate(order.discount.expiresAt)}</p>
              )}
            </div>
          </div>
        )}

        {/* Order Status */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Order Status</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                OrderStatusColors[order.status as keyof typeof OrderStatusColors]
              }`}>
                {order.status}
              </span>
              <p className="text-sm text-gray-500">
                Created: {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Status Update Actions */}
        {!readOnly && onUpdateStatus && order.status !== OrderStatus.COMPLETED && (
          <div className="flex flex-wrap gap-2">
            {order.status === OrderStatus.CANCELLED && (
              <button
                onClick={() => onUpdateStatus(order.id, OrderStatus.PENDING)}
                className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                Reactivate Order
              </button>
            )}
            {order.status === OrderStatus.PENDING && (
              <button
                onClick={() => onUpdateStatus(order.id, OrderStatus.PACKAGING)}
                className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                Start Packaging
              </button>
            )}
            {order.status === OrderStatus.PACKAGING && (
              <button
                onClick={() => onUpdateStatus(order.id, OrderStatus.DELIVERING)}
                className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200"
              >
                Start Delivery
              </button>
            )}
            {order.status === OrderStatus.DELIVERING && (
              <button
                onClick={() => onUpdateStatus(order.id, OrderStatus.DELIVERED)}
                className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              >
                Mark Delivered
              </button>
            )}
            {order.status === OrderStatus.DELIVERED && (
              <button
                onClick={() => onUpdateStatus(order.id, OrderStatus.COMPLETED)}
                className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200"
              >
                Complete Order
              </button>
            )}
            {order.status !== OrderStatus.CANCELLED && (
              <button
                onClick={() => onUpdateStatus(order.id, OrderStatus.CANCELLED)}
                className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
              >
                Cancel Order
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
} 