import { getBusinessById } from '@/lib/services/business.service';
import { notFound } from 'next/navigation';
import ProductCard from '@/app/components/product-card';
import Link from 'next/link';
import { Tag } from 'lucide-react';
import { getSession } from '@/lib/auth/session';

interface MarketDetailsProps {
  params: {
    businessId: string;
  };
}

export default async function MarketDetails({ params }: MarketDetailsProps) {
  // Get the current user session
  const session = await getSession();
  const userId = session?.user?.id;
  
  // Pass the userId to getBusinessById - only products that are available will be shown unless viewer is owner
  const business = await getBusinessById(params.businessId, userId);

  if (!business) {
    notFound();
  }
  
  // Check if the current user is the business owner
  const isOwner = userId && business.userId === userId;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Business Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary mb-2">{business.name}</h1>
        <p className="text-gray-600 mb-4">{business.description}</p>
        
        {/* Categories */}
        {business.categories && business.categories.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {business.categories.map((category) => (
                <Link 
                  key={category.id} 
                  href={`/category/${category.id}`}
                  className="inline-flex items-center text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* SubCategories */}
        {business.subCategories && business.subCategories.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Subcategories</h3>
            <div className="flex flex-wrap gap-2">
              {business.subCategories.map((subCategory) => (
                <Link 
                  key={subCategory.id} 
                  // href={`/category/${subCategory.categoryId}/subcategory/${subCategory.id}`}
                  href={`/category/${subCategory.categoryId}`}
                  className="inline-flex items-center text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {subCategory.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {business.products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            description={product.description}
            price={product.finalPrice}
            imageUrl={product.imageUrl}
            images={product.images || []}
            stock={product.stock}
            businessId={business.id}
            isAvailable={product.isAvailable}
            isOwner={isOwner}
          />
        ))}
      </div>

      {/* Empty State */}
      {business.products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products available yet.</p>
        </div>
      )}
    </div>
  );
}

