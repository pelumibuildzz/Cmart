import { getSession } from '@/lib/auth/session';
import { getProducts } from '@/lib/services/product.service';
import { redirect } from 'next/navigation';
import { Role } from '@/lib/constants';
import MarkupTable from '@/app/components/admin/markup-table';

export default async function MarkupManager() {
  const session = await getSession();
  
  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect('/auth/signin');
  }

  // Get all products with their business info
  const products = await getProducts({
    orderBy: { 
      name: 'asc' 
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-secondary">Product Markup Management</h1>
          <a 
            href="/admin/dashboard" 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Back to Dashboard
          </a>
        </div>
        
        <MarkupTable products={products} />
      </div>
    </div>
  );
}
