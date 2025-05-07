'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store/cart';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Store, MapPin } from 'lucide-react';
import { fetchBusinessData } from '../actions/business.action';
import { fetchUniversityData } from '../actions/university.action';
import { createCheckout } from '../actions/checkout.action';
import { toast } from 'react-hot-toast';

interface Business {
  id: string;
  name: string;
}

interface University {
  id: string;
  name: string;
}

export default function CheckoutPage() {
  const { items, getBusinessTotal } = useCartStore();
  const [businesses, setBusinesses] = useState<Map<string, Business>>(new Map());
  const [userUniversity, setUserUniversity] = useState<University | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shippingCost, setShippingCost] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Group items by business
  const businessGroups = items.reduce((acc, item) => {
    const group = acc.get(item.businessId) || [];
    group.push(item);
    acc.set(item.businessId, group);
    return acc;
  }, new Map<string, typeof items>());

  // Calculate totals
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  let tax = subtotal * 0.075; // 7.5% tax
  // if(tax > 2000) tax = 2000;
  const total = subtotal + tax + shippingCost;

  // Fetch business data and user's university
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      // Fetch businesses
      const businessesMap = new Map<string, Business>();
      for (const [businessId] of businessGroups) {
        const business = await fetchBusinessData(businessId);
        if (business && isMounted) {
          businessesMap.set(businessId, business);
        }
      }
      
      if (isMounted) {
        setBusinesses(businessesMap);
      }

      // Fetch user's university if logged in
      if (session?.user?.id) {
        const university = await fetchUniversityData(session.user.id);
        if (isMounted) {
          setUserUniversity(university);
          // Calculate shipping cost here based on university
          const calculatedShipping = university ? 500 : 0; // Example calculation
          setShippingCost(calculatedShipping);
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [session, items.length]);

  // Redirect if cart is empty or user is not authenticated
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, status, router]);

  if (status === 'loading' || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const handleCheckout = async () => {
    try {
      setIsProcessing(true);
      
      // For demo purposes - in a real app, integrate with Paystack or other payment provider
      // and get the actual payment ID from the payment response
      const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      const result = await createCheckout(
        mockPaymentId,
        items,
        total,
        tax,
        shippingCost
      );
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      if (result.success) {
        // Clear cart after successful checkout
        useCartStore.getState().clearCart();
        
        // Redirect to order confirmation page
        router.push(`/orders/${result.orderGroupId}`);
        toast.success('Order placed successfully!');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          {Array.from(businessGroups).map(([businessId, businessItems]) => (
            <div key={businessId} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 p-4 flex items-center gap-2 border-b">
                <Store className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg text-secondary">
                  {businesses.get(businessId)?.name || 'Loading...'}
                </span>
              </div>

              <div className="divide-y">
                {businessItems.map((item) => (
                  <div key={item.id} className="p-4 flex items-center gap-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>

                    <div className="flex-grow">
                      <h3 className="font-semibold text-secondary">{item.name}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-primary font-medium">₦{item.price.toFixed(2)}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">₦{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-4 flex justify-between items-center">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold">₦{getBusinessTotal(businessId).toFixed(2)}</span>
              </div>
            </div>
          ))}

          {/* Delivery Location */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Delivery Location
            </h2>
            <div className="bg-gray-50 p-4 rounded-md">
              {userUniversity ? (
                <div>
                  <p className="font-medium text-secondary">{userUniversity.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Delivery will be made to your university address
                  </p>
                </div>
              ) : (
                <p className="text-gray-600">Loading delivery location...</p>
              )}
            </div>
          </div>
        </div>

        {/* Order Total */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₦{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">VAT (7.5%)</span>
                <span className="font-medium">₦{tax.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {userUniversity ? `₦${shippingCost.toFixed(2)}` : 'Calculating...'}
                </span>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-xl text-primary">₦{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-6 bg-primary text-white py-3 px-4 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!userUniversity || shippingCost === 0 || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Proceed to Payment'}
            </button>

            <p className="text-sm text-gray-500 mt-4 text-center">
              Payment will be processed securely via Paystack
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}