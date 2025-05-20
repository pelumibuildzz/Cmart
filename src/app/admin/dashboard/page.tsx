import { getSession } from '@/lib/auth/session';
import { getBusinesses, updateBusiness } from '@/lib/services/business.service';
import { getOrders, updateOrder } from '@/lib/services/order.service';
import { redirect } from 'next/navigation';
import { Role } from '@/lib/constants';
import { OrderStatusType } from '@/lib/constants/order';
import { revalidatePath } from 'next/cache';
import AdminDashboardClient from './AdminDashboardClient';
import { Order, User } from '@/types/business';

// Define the AdminBusiness type to match what's expected in AdminDashboardClient
interface BusinessCategory {
  id: string;
  name: string;
}

interface AdminBusiness {
  id: string;
  userId: string;
  name: string;
  description: string;
  universityId: string;
  averageRating: number;
  totalRatings: number;
  isVerified: boolean;
  categories: BusinessCategory[];
  subCategories: { id: string; name: string; categoryId: string }[];
  user: User;
}

export default async function AdminDashboard() {
  const session = await getSession();
  
  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect('/auth/signin');
  }

  const [businessesData, ordersData] = await Promise.all([
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
        user: true,
        business: true,
        orderItems: {
          include: {
            product: true
          }
        },
        orderGroup: true,
        discount: true
      }
    })
  ]);

  // Type cast the data to match the expected types
  const businesses = businessesData as unknown as AdminBusiness[];
  const orders = ordersData as unknown as Order[];
  async function verifyBusiness(businessId: string, isVerified: boolean) {
    'use server';
    await updateBusiness(businessId, { isVerified });
    // Revalidate both admin dashboard and home page to update featured markets
    revalidatePath('/admin/dashboard');
    revalidatePath('/');
    revalidatePath('/markets');
    revalidatePath('/products');
  }

  async function updateOrderStatus(orderId: string, status: OrderStatusType) {
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

