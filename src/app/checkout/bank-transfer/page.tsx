'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart';
import { toast } from 'react-hot-toast';
import { fetchUniversities } from '@/app/actions/university.action';
import { processBankTransferPayment } from '@/app/actions/bankTransfer.action';
import ShippingInfoForm from '@/app/components/checkout/ShippingInfoForm';
import PaymentMethodSelection from '@/app/components/checkout/PaymentMethodSelection';
import BankTransferDetails from '@/app/components/checkout/BankTransferDetails';
import ReceiptUploadForm from '@/app/components/checkout/ReceiptUploadForm';
import OrderConfirmation from '@/app/components/checkout/OrderConfirmation';
import { University } from '@/generated/prisma';
import { useSession } from 'next-auth/react';

enum CheckoutStep {
  SHIPPING = 'shipping',
  PAYMENT_METHOD = 'payment-method',
  BANK_DETAILS = 'bank-details',
  RECEIPT_UPLOAD = 'receipt-upload',
  CONFIRMATION = 'confirmation',
}

interface OrderDetails {
  subtotal: number;
  shippingCost: number;
  total: number;
  orderGroupId: string;
}

export default function BankTransferCheckoutPage() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(CheckoutStep.SHIPPING);
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [shippingInfo, setShippingInfo] = useState<{
    name: string;
    hall: string;
    universityId: string;
  }>({
    name: '',
    hall: '',
    universityId: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderGroupId, setOrderGroupId] = useState<string>('');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  
  const { items, clearCart, setUserId } = useCartStore();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const subtotal = orderDetails?.subtotal || items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingCost = orderDetails?.shippingCost || 500; // Fixed shipping fee
  const total = orderDetails?.total || (subtotal + shippingCost);
  
  // Initialize cart with user ID
  useEffect(() => {
    if (status === 'loading') return;

    setUserId(session?.user?.id || null);

    // Redirect unauthenticated users
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [session, status, setUserId, router]);
  
  // Load saved order details from localStorage on component mount
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const savedOrderDetails = localStorage.getItem('bankTransferOrderDetails');
      const savedStep = localStorage.getItem('bankTransferCheckoutStep');
      
      if (savedOrderDetails) {
        const parsedDetails = JSON.parse(savedOrderDetails);
        setOrderDetails(parsedDetails);
        setOrderGroupId(parsedDetails.orderGroupId || '');
      }
      
      if (savedStep && Object.values(CheckoutStep).includes(savedStep as CheckoutStep)) {
        setCurrentStep(savedStep as CheckoutStep);
      }
    }
  }, []);
  
  // Save current step to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && currentStep) {
      localStorage.setItem('bankTransferCheckoutStep', currentStep);
    }
  }, [currentStep]);
  
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const result = await fetchUniversities();
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (result.universities) {
          setUniversities(result.universities);
        }
      } catch (error) {
        console.error('Error fetching universities:', error);
        toast.error('Failed to load universities. Please refresh the page.');
      }
    };
    
    loadUniversities();
  }, []);
  
  useEffect(() => {
    if (items.length === 0 && currentStep !== CheckoutStep.CONFIRMATION && !orderDetails) {
      router.push('/cart');
      toast('Your cart is empty. Add some items before checkout.');
    }
  }, [items, router, currentStep, orderDetails]);
  
  const handleShippingSubmit = (data: { name: string; hall: string; universityId: string }) => {
    setShippingInfo(data);
    setCurrentStep(CheckoutStep.PAYMENT_METHOD);
  };
  
  const handlePaymentMethodSelect = (bankId: string) => {
    setSelectedBankId(bankId);
    setCurrentStep(CheckoutStep.BANK_DETAILS);
  };
  
  const handleBankDetailsComplete = () => {
    setCurrentStep(CheckoutStep.RECEIPT_UPLOAD);
  };
  
  const handleReceiptSubmit = async (data: { receiptImage: File; payerAccountName: string }) => {
    try {
      setIsProcessing(true);
      
      const result = await processBankTransferPayment(
        items,
        total,
        // tax,
        shippingCost,
        data.receiptImage,
        data.payerAccountName,
        shippingInfo
      );
      
      if (result.error) {
        toast.error(result.error);
        setIsProcessing(false);
        return;
      }
      
      if (result.success) {
        // Save order details before clearing cart
        const details: OrderDetails = {
          subtotal,
          shippingCost,
          total,
          orderGroupId: result.orderGroupId
        };
        
        // Store in state
        setOrderDetails(details);
        setOrderGroupId(result.orderGroupId);
        
        // Store in localStorage
        localStorage.setItem('bankTransferOrderDetails', JSON.stringify(details));
        
        // Clear cart after successful payment
        clearCart();
        
        // Move to confirmation step
        setCurrentStep(CheckoutStep.CONFIRMATION);
        
        toast.success('Your order has been placed successfully and is awaiting verification.');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Bank Transfer Checkout</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }
  
  if (items.length === 0 && currentStep !== CheckoutStep.CONFIRMATION && !orderDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Bank Transfer Checkout</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Bank Transfer Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {currentStep === CheckoutStep.SHIPPING && (
            <ShippingInfoForm
              universities={universities}
              onSubmit={handleShippingSubmit}
              isLoading={isProcessing}
            />
          )}
          
          {currentStep === CheckoutStep.PAYMENT_METHOD && (
            <PaymentMethodSelection
              onSelect={handlePaymentMethodSelect}
              isLoading={isProcessing}
            />
          )}
          
          {currentStep === CheckoutStep.BANK_DETAILS && (
            <BankTransferDetails
              bankAccountId={selectedBankId}
              amount={total}
              onComplete={handleBankDetailsComplete}
              isLoading={isProcessing}
            />
          )}
          
          {currentStep === CheckoutStep.RECEIPT_UPLOAD && (
            <ReceiptUploadForm
              onSubmit={handleReceiptSubmit}
              isLoading={isProcessing}
            />
          )}
          
          {currentStep === CheckoutStep.CONFIRMATION && (
            <OrderConfirmation
              orderGroupId={orderGroupId}
            />
          )}
        </div>
        
        {currentStep !== CheckoutStep.CONFIRMATION && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₦{subtotal.toFixed(2)}</span>
                </div>
                
                {/* <div className="flex justify-between">
                  <span className="text-gray-600">VAT (7.5%)</span>
                  <span className="font-medium">₦{tax.toFixed(2)}</span>
                </div> */}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">₦{shippingCost.toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-xl text-primary">₦{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <div className="text-sm text-gray-600">
                  <p>Selected payment method:</p>
                  <p className="font-medium text-gray-800">Bank Transfer</p>
                </div>
                
                {currentStep >= CheckoutStep.SHIPPING && shippingInfo.name && (
                  <div className="text-sm text-gray-600 mt-4">
                    <p>Delivery to:</p>
                    <p className="font-medium text-gray-800">{shippingInfo.name}</p>
                    <p className="text-gray-600">{shippingInfo.hall}</p>
                    <p className="text-gray-600">
                      {universities.find(u => u.id === shippingInfo.universityId)?.name || ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add a way to reset order data if in confirmation step */}
      {currentStep === CheckoutStep.CONFIRMATION && orderDetails && (
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              localStorage.removeItem('bankTransferOrderDetails');
              localStorage.removeItem('bankTransferCheckoutStep');
              setOrderDetails(null);
              setCurrentStep(CheckoutStep.SHIPPING);
              router.push('/markets');
            }}
            className="text-primary hover:text-primary/80 underline"
          >
            Start a new order
          </button>
        </div>
      )}
    </div>
  );
} 