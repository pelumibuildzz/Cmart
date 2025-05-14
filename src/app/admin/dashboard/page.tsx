import { getSession } from '@/lib/auth/session';
import { getBusinesses, updateBusiness } from '@/lib/services/business.service';
import { getOrders, updateOrder } from '@/lib/services/order.service';
import { redirect } from 'next/navigation';
import { Role } from '@/lib/constants';
import { revalidatePath } from 'next/cache';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboard() {
  const session = await getSession();
  
  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect('/auth/signin');
  }

  const [businesses, orders] = await Promise.all([
    getBusinesses({ 
      include: { 
        user: true, 
        categories: true,
        subCategories: true
      } 
    }),
    getOrders({ 
      orderBy: { createdAt: 'desc' },
      include: {
        orderGroup: true,
        discount: true
      }
    })
  ]);

  async function verifyBusiness(businessId: string, isVerified: boolean) {
    'use server';
    await updateBusiness(businessId, { isVerified });
    revalidatePath('/admin/dashboard');
  }

  async function updateOrderStatus(orderId: string, status: string) {
    'use server';
    await updateOrder(orderId, { status });
    revalidatePath('/admin/dashboard');
  }

  return (
    <AdminDashboardClient
      businesses={businesses}
      orders={orders}
      verifyBusiness={verifyBusiness}
      updateOrderStatus={updateOrderStatus}
    />
  );
}

