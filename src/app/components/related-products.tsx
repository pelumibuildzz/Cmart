'use client';

import { useEffect, useState } from 'react';
import ProductCard from './product-card';

interface RelatedProductsProps {
  productId: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  finalPrice: number;
  imageUrl: string;
  images: Array<{ id: string; url: string; fileId?: string; productId: string }>;
  stock: number;
  businessId: string;
  isAvailable: boolean;
  categories?: Array<{ id: string; name: string }>;
  subCategories?: Array<{ id: string; name: string }>;
}

export default function RelatedProducts({ productId }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/products/${productId}/related`);
        if (!response.ok) {
          throw new Error('Failed to fetch related products');
        }
        
        const products = await response.json();
        setRelatedProducts(products);
      } catch (err) {
        console.error('Error fetching related products:', err);
        setError('Failed to load related products');
      } finally {
        setLoading(false);
      }
    }

    fetchRelatedProducts();
  }, [productId]);

  if (loading) {
    return (
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Loading skeleton */}
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null; // Don't show section if no related products
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
        {/* Responsive grid: 1-2 cols mobile, 2-3 cols tablet, 4 cols desktop */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {relatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            description={product.description}
            price={product.finalPrice}
            imageUrl={product.imageUrl}
            images={product.images}
            stock={product.stock}
            businessId={product.businessId}
            categories={product.categories}
            subCategories={product.subCategories}
            isAvailable={product.isAvailable}
          />
        ))}
      </div>
    </div>
  );
}
