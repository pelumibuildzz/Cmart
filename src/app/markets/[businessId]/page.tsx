import { getBusinessById } from '@/lib/services/business.service';
import { notFound } from 'next/navigation';
import ProductCard from '@/app/components/product-card';

interface MarketDetailsProps {
  params: {
    businessId: string;
  };
}

export default async function MarketDetails({ params }: MarketDetailsProps) {
  const business = await getBusinessById(params.businessId);

  if (!business) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Business Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary mb-2">{business.name}</h1>
        <p className="text-gray-600">{business.description}</p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {business.products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            description={product.description}
            price={product.price}
            imageUrl={product.imageUrl}
            images={product.images || []}
            stock={product.stock}
            businessId={business.id}
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

