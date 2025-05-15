import { getSession } from '@/lib/auth/session';
import { getBusinessByUserId } from '@/lib/services/business.service';
import { getOrdersByBusinessId } from '@/lib/services/order.service';
import { getProductsByBusinessId } from '@/lib/services/product.service';
import { redirect } from 'next/navigation';
import BusinessDashboardClient from './BusinessDashboardClient';
import { Order } from '@/types/business';

export default async function Dashboard() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const business = await getBusinessByUserId(session.user.id);
  
  
  if (!business) {
    redirect('/');
  }

  const products = await getProductsByBusinessId(business.id);
  const orders = await getOrdersByBusinessId(business.id) as Order[];

  return (
    <BusinessDashboardClient 
      business={business}
      products={products}
      orders={orders}
    />
  );
}

