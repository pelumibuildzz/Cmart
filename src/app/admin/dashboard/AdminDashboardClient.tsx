'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, ShoppingBag, Eye } from 'lucide-react';
import { OrderStatus, OrderStatusColors, OrderStatusType } from '@/lib/constants/order';
import OrderDetailsModal from '@/app/components/OrderDetailsModal';
import { Order, User } from '@/types/business';
import BusinessesTable from '@/app/components/admin/businesses-table';

interface BusinessCategory {
  id: string;
  name: string;
}

// Extended Business interface that includes user information
interface AdminBusiness {
  id: string;
  userId: string;
  name: string;
  description: string;
  universityId: string;
  averageRating: number;
  totalRatings: number;
  isVerified: boolean;
  categories: BusinessCategory[];
  subCategories: { id: string; name: string; categoryId: string }[];
  user: User;
}

interface AdminDashboardClientProps {
  businesses: AdminBusiness[];
  orders: Order[];
  verifyBusiness: (businessId: string, isVerified: boolean) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatusType) => Promise<void>;
}

export default function AdminDashboardClient({
  businesses,
  orders,
  verifyBusiness,
  updateOrderStatus,
}: AdminDashboardClientProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Filter out UNVERIFIED orders
  const unverifiedOrders = orders.filter(order => order.status === OrderStatus.UNVERIFIED);
  const otherOrders = orders.filter(order => order.status !== OrderStatus.UNVERIFIED);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-secondary mb-8">Admin Dashboard</h1>

        {/* Businesses Section */}
        <BusinessesTable businesses={businesses} onVerifyBusiness={verifyBusiness} />

        {/* Unverified Orders Section */}
        {unverifiedOrders.length > 0 && (
          <div className="bg-orange-50 rounded-lg shadow-md border border-orange-200 mb-8">
            <div className="p-6 border-b border-orange-200">
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 text-orange-500 mr-2" />
                <h2 className="text-xl font-semibold text-secondary">
                  Orders Pending Payment Verification ({unverifiedOrders.length})
                </h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-orange-200">
                <thead className="bg-orange-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-orange-200">
                  {unverifiedOrders.map((order) => (
                    <tr key={order.id} className="bg-orange-50/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.id.slice(0, 8)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.user.name}</div>
                        <div className="text-sm text-gray-500">{order.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.business.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₦{order.total.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Receipt
                          </button>
                          <form className="flex gap-2 flex-wrap">
                            <button
                              type="submit"
                              formAction={updateOrderStatus.bind(null, order.id, OrderStatus.PENDING)}
                              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Verify Payment
                            </button>
                            <button
                              type="submit"
                              formAction={updateOrderStatus.bind(null, order.id, OrderStatus.CANCELLED)}
                              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject Payment
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Regular Orders Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <ShoppingBag className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-xl font-semibold text-secondary">Orders</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Group
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {otherOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.user.name}</div>
                      <div className="text-sm text-gray-500">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.business.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.orderGroup ? order.orderGroup.id.slice(0, 8) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        OrderStatusColors[order.status as keyof typeof OrderStatusColors]
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₦{order.total.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                        <form className="flex gap-2 flex-wrap">
                          {order.status !== OrderStatus.COMPLETED && (
                            <>
                              {order.status === OrderStatus.PENDING && (
                                <button
                                  type="submit"
                                  formAction={updateOrderStatus.bind(null, order.id, OrderStatus.PACKAGING)}
                                  className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                                >
                                  Start Packaging
                                </button>
                              )}
                              {order.status === OrderStatus.PACKAGING && (
                                <button
                                  type="submit"
                                  formAction={updateOrderStatus.bind(null, order.id, OrderStatus.DELIVERING)}
                                  className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200"
                                >
                                  Start Delivery
                                </button>
                              )}
                              {order.status === OrderStatus.DELIVERING && (
                                <button
                                  type="submit"
                                  formAction={updateOrderStatus.bind(null, order.id, OrderStatus.DELIVERED)}
                                  className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                                >
                                  Mark Delivered
                                </button>
                              )}
                              {order.status === OrderStatus.DELIVERED && (
                                <button
                                  type="submit"
                                  formAction={updateOrderStatus.bind(null, order.id, OrderStatus.COMPLETED)}
                                  className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200"
                                >
                                  Complete Order
                                </button>
                              )}
                            </>
                          )}
                          {order.status !== OrderStatus.CANCELLED && (
                            <button
                              type="submit"
                              formAction={updateOrderStatus.bind(null, order.id, OrderStatus.CANCELLED)}
                              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              Cancel
                            </button>
                          )}
                          {order.status === OrderStatus.CANCELLED && (
                            <button
                              type="submit"
                              formAction={updateOrderStatus.bind(null, order.id, OrderStatus.PENDING)}
                              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                            >
                              Reactivate
                            </button>
                          )}
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onUpdateStatus={(orderId, status) => updateOrderStatus(orderId, status as OrderStatusType)}
      />
    </div>
  );
} 