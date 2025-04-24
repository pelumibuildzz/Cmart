import { getProducts } from '@/lib/services/product.service';
import { getCategories } from '@/lib/services/category.service';
import { getUniversities } from '@/lib/services/university.service';
import { getBusinesses } from '@/lib/services';
import Link from 'next/link';
import { Search, MapPin } from 'lucide-react';
import ProductCard from '@/app/components/product-card';

export default async function Home() {
  const products = await getProducts({ 
    where: { isAvailable: true },
    take: 8,
  });
  
  const categories = await getCategories({take: 4});
  const universities = await getUniversities({take: 4});
  const markets = await getBusinesses({ take: 4});

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[600px] w-full">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("/hero-bg.jpg")', // You'll need to add this image
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-secondary/70" />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-6">
            Welcome to C-Mart
          </h1>
          <p className="text-xl md:text-2xl text-white text-center mb-12 max-w-3xl">
            Your one-stop marketplace for university commerce. Find everything you need within your campus community.
          </p>

          {/* Search Section */}
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-2">
            <div className="flex flex-col md:flex-row gap-2">
              {/* University Select */}
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <MapPin className="h-5 w-5 text-secondary" />
                </div>
                <select 
                  className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  defaultValue=""
                >
                  <option value="" disabled>Select University</option>
                  {universities.map((uni) => (
                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                  ))}
                </select>
              </div>

              {/* Category Select */}
              <div className="flex-1">
                <select 
                  className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  defaultValue=""
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <button className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <Search className="h-5 w-5" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-secondary mb-8">Browse Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/category/${category.id}`}
                className="group relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-square w-full" />
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/5" 
                  style={{
                    backgroundImage: `url('/images/${category.name}.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-300"></div>
                  <span className="relative z-10 text-primary text-lg font-medium group-hover:text-white transition-colors duration-300">
                    {category.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Markets */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-secondary">Featured Markets</h2>
            <Link href="/markets" className="text-primary hover:text-primary/80 font-medium">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {markets.map((business) => (
              <Link 
                key={business.id} 
                href={`/markets/${business.id}`}
                className="group relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-square w-full bg-gray-200" />
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/60 group-hover:bg-secondary/70 transition-colors">
                  <span className="text-white text-lg font-medium">{business.name}</span>
                </div>
              </Link>
            ))}
          </div>
          
          {markets.length === 0 && (
            <p className="text-center py-8 text-gray-500">
              No products available yet.
            </p>
          )}
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-secondary">Featured Products</h2>
            <Link href="/markets" className="text-primary hover:text-primary/80 font-medium">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                imageUrl={product.imageUrl}
                images={product.images}
                stock={product.stock}
                businessId={product.Business.id}
              />
            ))}
          </div>
          
          {products.length === 0 && (
            <p className="text-center py-8 text-gray-500">
              No products available yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
