import { getSession } from '@/lib/auth/session';
import { getBusinessByUserId } from '@/lib/services/business.service';
import { getCategories } from '@/lib/services/category.service';
import { getProductById } from '@/lib/services/product.service';
import { redirect } from 'next/navigation';
import ProductForm from '@/app/components/product-form';



export default async function EditProduct({ params }: { params : Promise<{ id: string }>}) {
  // Access the id parameter after explicitly receiving it via props
  const { id } = await params;
  
  const session = await getSession();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const business = await getBusinessByUserId(session.user.id);
  
  if (!business) {
    redirect('/business/create');
  }

  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories()
  ]);

  if (!product || product.businessId !== business.id) {
    redirect('/business/dashboard');
  }
  // Transform the product to match what ProductForm expects
  const transformedProduct = {
    ...product,
    price: product.finalPrice, // Map finalPrice to price property
    categoryId: product.categories?.[0]?.id || '', // Get first categoryId if available
    // Fix video thumbnailUrl from string|null to string|undefined
    videos: product.videos?.map(video => ({
      ...video,
      thumbnailUrl: video.thumbnailUrl || undefined // Convert null to undefined
    }))
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-secondary">Edit Product</h1>
          </div>
          <div className="p-6">
            <ProductForm 
              type="edit"
              businessId={business.id} 
              categories={categories}
              product={transformedProduct}
            />
          </div>
        </div>
      </div>
    </div>
  );
}