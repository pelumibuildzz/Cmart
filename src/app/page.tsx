import { getCategories } from '@/lib/services/category.service';
import Link from 'next/link';
import SearchBar from '@/app/components/search-bar';
import { Suspense } from 'react';
import FeaturedMarkets from './components/featured-markets';
import FeaturedProducts from './components/featured-products';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const categories = await getCategories({take: 4});

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[600px] w-full">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("/hero2.jpg")',
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

          {/* Updated Search Section */}
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-2">
            <SearchBar />
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

      {/* Featured Markets - Now rendered dynamically */}
      <Suspense fallback={<div className="py-16 px-4 text-center">Loading featured markets...</div>}>
        <FeaturedMarkets />
      </Suspense>
      
      {/* Featured Products - Now rendered dynamically */}
      <Suspense fallback={<div className="py-16 px-4 text-center">Loading featured products...</div>}>
        <FeaturedProducts />
      </Suspense>
    </div>
  );
}
