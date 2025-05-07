import { getSession } from '@/lib/auth/session';
import { getOrderGroupsByUserId } from '@/lib/services/order.service';
import { redirect } from 'next/navigation';
import OrdersList from './OrdersList';

export default async function OrderListPage() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const orderGroups = await getOrderGroupsByUserId(session.user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <OrdersList orderGroups={orderGroups} />
    </div>
  );
}

