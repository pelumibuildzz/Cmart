import { getOrderGroupById } from '@/lib/services/order.service';
import { getSession } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Store, MapPin } from 'lucide-react';
import OrderStatusBadge from '@/app/components/OrderStatusBadge';


export default async function OrderDetailsPage({ params }: { params: Promise<{ orderId: string }>}) {
  const session = await getSession();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Ensure orderId is a string
  const { orderId } = await params;
  
  const orderGroup = await getOrderGroupById(orderId);
  
  if (!orderGroup || orderGroup.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/orders" className="flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to orders
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Order #{orderGroup.id.slice(-8)}</h1>
            <OrderStatusBadge status={orderGroup.status} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Order Date</h3>
              <p className="mt-1">{format(new Date(orderGroup.createdAt), 'PPP')}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
              <p className="mt-1 text-xl font-bold text-primary">₦{orderGroup.total.toFixed(2)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Payment</h3>
              <p className="mt-1">{orderGroup.paymentId ? `Paid (ID: ${orderGroup.paymentId.slice(-6)})` : 'Pending'}</p>
            </div>
          </div>
          
          {/* Shipping Information */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Shipping Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Recipient</h4>
                <p className="mt-1">{orderGroup.shippingName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Hall/Building</h4>
                <p className="mt-1">{orderGroup.shippingHall}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">University</h4>
                <p className="mt-1">{orderGroup.shippingUniversity?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Individual Orders */}
      <h2 className="text-xl font-semibold mb-4">Order Items</h2>
      
      <div className="space-y-8">
        {orderGroup.orders.map((order: any) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 p-4 flex items-center border-b">
              <Store className="h-5 w-5 text-primary mr-2" />
              <span className="font-medium">{order.business.name}</span>
              <OrderStatusBadge status={order.status} className="ml-auto" />
            </div>
            
            <div className="divide-y">
              {order.orderItems.map((item: any) => (
                <div key={item.id} className="p-4 flex items-center">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  
                  <div className="ml-4 flex-grow">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × ₦{item.price.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold">₦{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-gray-50 flex justify-between border-t">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold">₦{order.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

