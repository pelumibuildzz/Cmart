import { getProducts } from '@/lib/services/product.service';
import { getBusinesses } from '@/lib/services';
import { getCategories } from '@/lib/services/category.service';
import ProductCard from '@/app/components/product-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import Link from 'next/link';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { query: string };
}) {
  const query = searchParams.query || '';

  // Fetch products, businesses, and categories that match the search query
  const products = await getProducts({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
      isAvailable: true,
    },
  });

  const businesses = await getBusinesses({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
  });

  const categories = await getCategories({
    where: {
      name: { contains: query, mode: 'insensitive' },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-secondary mb-6">
        Search Results for "{query}"
      </h1>

      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger value="products">
            Products ({products.length})
          </TabsTrigger>
          <TabsTrigger value="businesses">
            Businesses ({businesses.length})
          </TabsTrigger>
          <TabsTrigger value="categories">
            Categories ({categories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.finalPrice}
                  imageUrl={product.imageUrl}
                  images={product.images}
                  stock={product.stock}
                  businessId={product.business.id}
                  categories={product.categories}
                  subCategories={product.subCategories}
                />
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">
              No products found matching your search.
            </p>
          )}
        </TabsContent>

        <TabsContent value="businesses">
          {businesses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <Link
                  key={business.id}
                  href={`/markets/${business.id}`}
                  className="block p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video w-full bg-gray-200 mb-4 rounded-md overflow-hidden">
                    {typeof business.logo === 'string' && business.logo && (
                      <img 
                        src={business.logo} 
                        alt={business.name} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-secondary mb-2">{business.name}</h3>
                  <p className="text-gray-600 line-clamp-2">{business.description}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">
              No businesses found matching your search.
            </p>
          )}
        </TabsContent>

        <TabsContent value="categories">
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.id}`}
                  className="group relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow aspect-square"
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100/5" 
                    style={{
                      backgroundImage: `url('/images/${category.name}.jpg')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-300"></div>
                    <span className="relative z-10 text-lg font-medium text-white">
                      {category.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">
              No categories found matching your search.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 