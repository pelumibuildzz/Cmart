'use client';

import Link from 'next/link';
import { CheckCircle, ArrowRight, Phone, Clock } from 'lucide-react';

interface OrderConfirmationProps {
  orderGroupId: string;
}

export default function OrderConfirmation({
  orderGroupId,
}: OrderConfirmationProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-secondary mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600">
          Your order has been placed and is awaiting payment verification.
        </p>
      </div>

      <div className="border border-gray-200 rounded-lg p-5 mb-8">
        <div className="flex justify-between mb-4">
          <span className="text-gray-600">Order ID:</span>
          <span className="font-semibold">{orderGroupId.slice(0, 8)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Order Status:</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Awaiting Verification
          </span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8">
        <h3 className="font-medium text-blue-800 mb-3 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          What happens next?
        </h3>
        <ol className="list-decimal pl-5 space-y-2 text-blue-700">
          <li>Our team will verify your payment (typically within 1-3 hours during business hours).</li>
          <li>Once verified, your order status will change to "Processing".</li>
          <li>You'll be notified via email when your order status changes.</li>
          <li>You can track your order status from your account dashboard.</li>
        </ol>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-8">
        <h3 className="font-medium text-gray-800 mb-3 flex items-center">
          <Phone className="w-5 h-5 mr-2" />
          Need help with your order?
        </h3>
        <p className="text-gray-600 mb-3">
          If you have any questions or concerns about your order, please don't hesitate to contact us.
        </p>
        <div className="space-y-2 text-sm">
          <p className="text-gray-700">
            <strong>Email:</strong> support@c-mart.com
          </p>
          <p className="text-gray-700">
            <strong>Phone:</strong> +234 123 456 7890
          </p>
          <p className="text-gray-700">
            <strong>Hours:</strong> Monday-Friday, 9am-5pm WAT
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <Link 
          href={`/orders/${orderGroupId}`}
          className="flex-1 py-3 px-4 bg-primary text-white text-center rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors inline-flex items-center justify-center"
        >
          View Order Details
          <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
        <Link 
          href="/"
          className="flex-1 py-3 px-4 border border-gray-300 bg-white text-gray-700 text-center rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
} 