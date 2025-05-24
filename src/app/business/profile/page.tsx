import { getSession } from '@/lib/auth/session';
import { getBusinessByUserId } from '@/lib/services/business.service';
import { getCategories } from '@/lib/services/category.service';
import { redirect } from 'next/navigation';
import BusinessProfileClient from './BusinessProfileClient';

export default async function BusinessProfile() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const business = await getBusinessByUserId(session.user.id);
  
  if (!business) {
    redirect('/');
  }

  const categories = await getCategories();

  return (
    <BusinessProfileClient 
      business={business}
      categories={categories}
    />
  );
}
