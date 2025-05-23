import { getProducts } from '@/lib/services/product.service';
import Link from 'next/link';
import ProductCard from '@/app/components/product-card';
import { ClientCarousel, CarouselItem } from '@/app/components/client-carousel';

export const dynamic = 'force-dynamic';

// Threshold for when to switch to carousel
const CAROUSEL_THRESHOLD = 4;

export default async function FeaturedProducts() {
  // Remove the take limit to get all products
  const products = await getProducts({ 
    where: { isAvailable: true }
  });

  const useCarousel = products.length > CAROUSEL_THRESHOLD;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-secondary">Featured Products</h2>
          {/* <Link href="/products" className="text-primary hover:text-primary/80 font-medium">
            View All
          </Link> */}
        </div>
        
        {useCarousel ? (
          <div className="px-6">
            <ClientCarousel>
              {products.map((product) => (
                <CarouselItem key={product.id} className="pl-4 sm:basis-1/2 lg:basis-1/4">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    price={product.finalPrice}
                    imageUrl={product.imageUrl}
                    images={product.images?.map(image => ({
                      ...image,
                      fileId: image.fileId || undefined // Convert null to undefined
                    }))}
                    stock={product.stock}
                    businessId={product.business.id}
                    categories={product.categories}
                    subCategories={product.subCategories}
                  />
                </CarouselItem>
              ))}
            </ClientCarousel>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.finalPrice}
                imageUrl={product.imageUrl}
                images={product.images?.map(image => ({
                  ...image,
                  fileId: image.fileId || undefined // Convert null to undefined
                }))}
                stock={product.stock}
                businessId={product.business.id}
                categories={product.categories}
                subCategories={product.subCategories}
              />
            ))}
          </div>
        )}
        
        {products.length === 0 && (
          <p className="text-center py-8 text-gray-500">
            No products available yet.
          </p>
        )}
      </div>
    </section>
  );
}