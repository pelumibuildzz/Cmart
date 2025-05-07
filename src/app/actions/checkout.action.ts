'use server';

import { getSession } from '@/lib/auth/session';
import { OrderStatus } from '@/lib/constants/order';
import { createOrder, createOrderGroup } from '@/lib/services/order.service';
import { revalidatePath } from 'next/cache';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  businessId: string;
  stock: number;
  imageUrl: string;
}

interface BusinessGroup {
  businessId: string;
  items: CartItem[];
  subtotal: number;
}

export async function createCheckout(
  paymentId: string, 
  items: CartItem[], 
  totalAmount: number,
  taxAmount: number,
  shippingAmount: number
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }

    const userId = session.user.id;

    // Group items by business
    const businessGroups = items.reduce((groups, item) => {
      const group = groups.find(g => g.businessId === item.businessId);
      
      if (group) {
        group.items.push(item);
        group.subtotal += item.price * item.quantity;
      } else {
        groups.push({
          businessId: item.businessId,
          items: [item],
          subtotal: item.price * item.quantity
        });
      }
      
      return groups;
    }, [] as BusinessGroup[]);

    // Create order group first
    const orderGroup = await createOrderGroup({
      userId,
      total: totalAmount,
      status: OrderStatus.PENDING,
      paymentId,
      orders: {
        create: [] // We'll create orders separately
      }
    });

    // Create individual orders for each business
    const orderPromises = businessGroups.map(group => 
      createOrder({
        userId,
        businessId: group.businessId,
        orderGroupId: orderGroup.id,
        total: group.subtotal,
        status: OrderStatus.PENDING,
        OrderItems: {
          create: group.items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      })
    );

    const orders = await Promise.all(orderPromises);
    
    // Revalidate relevant paths
    revalidatePath('/orders');
    revalidatePath(`/orders/${orderGroup.id}`);
    
    return { 
      success: true, 
      orderGroupId: orderGroup.id,
      orders 
    };
  } catch (error) {
    console.error('Checkout error:', error);
    return { error: 'Failed to process checkout' };
  }
} 