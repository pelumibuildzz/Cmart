import Link from 'next/link';
import { Store } from 'lucide-react';


export default function BusinessCard({ business }: { business: any }) {
    return (
      <Link
      href={`/market/${business.id}`}
      >
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-secondary mb-2">{business.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{business.description}</p>
              </div>
              <Store className="text-primary flex-shrink-0" />
            </div>
            {business.category && (
              <span className="inline-block bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
                {business.category.name}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }