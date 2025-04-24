import { getSession } from '@/lib/auth/session';
import { getBusinessByUserId } from '@/lib/services/business.service';
import { getCategories } from '@/lib/services/category.service';
import { redirect } from 'next/navigation';
import ProductForm from '@/app/components/product-form';

export default async function NewProduct() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const business = await getBusinessByUserId(session.user.id);
  
  if (!business) {
    redirect('/business/create');
  }

  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-secondary">Add New Product</h1>
          </div>
          <div className="p-6">
            <ProductForm 
              type="create"
              businessId={business.id}
              categories={categories}
            />
          </div>
        </div>
      </div>
    </div>
  );
}