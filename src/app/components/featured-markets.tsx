import { getBusinesses } from '@/lib/services';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function FeaturedMarkets() {
  const markets = await getBusinesses({ 
    where: { isVerified: true },
    take: 4
  });

  return (
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
            No Markets available yet. Check back Tomorrow
          </p>
        )}
      </div>
    </section>
  );
} 