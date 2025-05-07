'use server';

import { getOrdersByBusinessId, updateOrder, getOrderGroupsByUserId, getOrderGroupById } from '@/lib/services/order.service';
import { getSession } from '@/lib/auth/session';

export async function fetchBusinessOrders(businessId: string) {
  try {
    const orders = await getOrdersByBusinessId(businessId);
    return { orders };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { error: 'Failed to fetch orders' };
  }
}

export async function fetchUserOrderGroups() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }
    
    const orderGroups = await getOrderGroupsByUserId(session.user.id);
    return { orderGroups };
  } catch (error) {
    console.error('Error fetching order groups:', error);
    return { error: 'Failed to fetch order groups' };
  }
}

export async function fetchOrderGroupDetails(orderGroupId: string) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }
    
    const orderGroup = await getOrderGroupById(orderGroupId);
    
    if (!orderGroup || orderGroup.userId !== session.user.id) {
      return { error: 'Order not found' };
    }
    
    return { orderGroup };
  } catch (error) {
    console.error('Error fetching order details:', error);
    return { error: 'Failed to fetch order details' };
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