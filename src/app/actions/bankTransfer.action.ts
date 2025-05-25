'use server';

import { getSession } from '@/lib/auth/session';
import { OrderStatus } from '@/lib/constants/order';
import { createOrder, createOrderGroup } from '@/lib/services/order.service';
import { uploadImage } from '@/lib/services/imagekit.service';
import { utilizeDiscount,  incrementUserOrderCount } from '@/lib/services/discount.service';
import { updateProductStock } from '@/lib/services/product.service';
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

interface ShippingInfo {
  name: string;
  hall: string;
  universityId: string;
}

export async function processBankTransferPayment(
  items: CartItem[],
  totalAmount: number,
  // taxAmount: number,
  shippingAmount: number,
  receiptImage: File,
  payerAccountName: string,
  shippingInfo: ShippingInfo,
  discountId?: string
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }

    const userId = session.user.id;

    // Validate receipt image
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    if (!ALLOWED_TYPES.includes(receiptImage.type)) {
      return { error: 'Invalid file type. Only JPG, PNG, and GIF images are allowed.' };
    }

    if (receiptImage.size > MAX_FILE_SIZE) {
      return { error: 'File size too large. Maximum size is 10MB.' };
    }    // Upload receipt image
    const receiptImageData = await uploadImage(
      receiptImage,
      `receipt-${Date.now()}-${receiptImage.name}`,
      'payment-receipts'
    );

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

    // Create order group
    const orderGroup = await createOrderGroup({
      userId,
      total: totalAmount,
      status: OrderStatus.UNVERIFIED,
      shippingName: shippingInfo.name,
      shippingHall: shippingInfo.hall,
      shippingUniversityId: shippingInfo.universityId,
      orders: {
        create: [] // We'll create orders separately
      }
    });    // Create individual orders for each business
    const orderPromises = businessGroups.map(group => 
      createOrder({        userId,
        businessId: group.businessId,
        orderGroupId: orderGroup.id,
        total: group.subtotal,
        status: OrderStatus.UNVERIFIED,
        paymentReceiptImageUrl: receiptImageData.url,
        payerAccountName,
        orderItems: {
          create: group.items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      })
    );

    const orders = await Promise.all(orderPromises);
    
    // Update product stock for each ordered item
    const stockUpdatePromises = items.map(item => 
      updateProductStock(item.id, item.quantity)
    );
    
    await Promise.all(stockUpdatePromises);
    
    // If there's a discount being applied, mark it as used
    if (discountId) {
      // Apply discount to the first order
      const firstOrder = orders[0];
      if (firstOrder) {
        await utilizeDiscount(discountId, firstOrder.id);
      }
    }

    // Increment user's order count for loyalty program
    await incrementUserOrderCount(userId);
    
    // Revalidate relevant paths
    revalidatePath('/orders');
    revalidatePath(`/orders/${orderGroup.id}`);
    
    return { 
      success: true, 
      orderGroupId: orderGroup.id,
      orders 
    };
  } catch (error) {
    console.error('Bank transfer checkout error:', error);
    return { error: 'Failed to process payment' };
  }
} 