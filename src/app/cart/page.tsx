'use client';

import { useCartStore } from '@/lib/store/cart';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, Store } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fetchBusinessData } from '../actions/business.action';

interface Business {
  id: string;
  name: string;
}

export default function Cart() {
  const { items, removeItem, updateQuantity, getBusinessTotal } = useCartStore();
  const [businesses, setBusinesses] = useState<Map<string, Business>>(new Map());

  // Group items by business
  const businessGroups = useMemo(() => {
    const groups = items.reduce((acc, item) => {
      const group = acc.get(item.businessId) || [];
      group.push(item);
      acc.set(item.businessId, group);
      return acc;
    }, new Map<string, typeof items>());
    
    return Array.from(groups.entries());
  }, [items]);

  // Fetch business names using server action
  useEffect(() => {
    const fetchBusinesses = async () => {
      const businessesMap = new Map<string, Business>();
      
      for (const [businessId] of businessGroups) {
        const business = await fetchBusinessData(businessId);
        if (business) {
          businessesMap.set(businessId, business);
        }
      }
      
      setBusinesses(businessesMap);
    };

    if (businessGroups.length > 0) {
      fetchBusinesses();
    }
  }, [businessGroups]);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-600 mb-4">Your cart is empty</p>
        <Link 
          href="/markets" 
          className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      
      <div className="grid gap-8 mb-8">
        {businessGroups.map(([businessId, businessItems]) => (
          <div key={businessId} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Business Header */}
            <div className="bg-gray-50 p-4 flex items-center gap-2 border-b">
              <Store className="h-5 w-5 text-primary" />
              <Link href={`/markets/${businessId}`} className="font-semibold text-lg text-secondary hover:text-primary transition-colors">
                {businesses.get(businessId)?.name || 'Loading...'}
              </Link>
            </div>
            
            {/* Business Items */}
            <div className="divide-y">
              {businessItems.map((item) => (
                <div 
                  key={item.id} 
                  className="p-4 flex items-center gap-4"
                >
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg text-secondary">{item.name}</h3>
                    <p className="text-primary font-medium">${item.price.toFixed(2)}</p>
                    
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.quantity >= item.stock}
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Stock Warning */}
                    {item.quantity >= item.stock && (
                      <p className="text-sm text-red-500 mt-1">
                        Maximum stock reached
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Business Subtotal */}
            <div className="bg-gray-50 p-4 flex justify-between items-center">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold text-lg">
                ${getBusinessTotal(businessId).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Cart Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4 mb-6">
          {businessGroups.map(([businessId, businessItems]) => (
            <div key={businessId} className="flex justify-between text-sm">
              <span>{businesses.get(businessId)?.name || 'Loading...'} Subtotal:</span>
              <span>${getBusinessTotal(businessId).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-4 flex justify-between items-center">
            <span className="text-xl font-bold">Total:</span>
            <span className="text-2xl font-bold text-primary">
              ${items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
            </span>
          </div>
        </div>
        
        <Link
          href="/checkout"
          className="block w-full text-center bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}