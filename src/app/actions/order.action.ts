'use server';

import { getOrdersByBusinessId, updateOrder } from '@/lib/services/order.service';

export async function fetchBusinessOrders(businessId: string) {
  try {
    const orders = await getOrdersByBusinessId(businessId);
    return { orders };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { error: 'Failed to fetch orders' };
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const order = await updateOrder(orderId, { status });
    return { order };
  } catch (error) {
    console.error('Error updating order:', error);
    return { error: 'Failed to update order' };
  }
}