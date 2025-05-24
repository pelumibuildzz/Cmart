import Link from 'next/link';
import Image from 'next/image';
import { Store, Tag } from 'lucide-react';

export default function BusinessCard({ business }: { business: any }) {
  return (
    <Link href={`/markets/${business.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {business.imageUrl ? (
          <div className="w-full h-40 relative">
            <Image 
              src={business.imageUrl} 
              alt={business.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
            <Store className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-secondary mb-2">{business.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{business.description}</p>
            </div>
            <Store className="text-primary flex-shrink-0" />
          </div>
          
          {/* Categories */}
          {business.categories && business.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {business.categories.map((category: any) => (
                <span key={category.id} className="inline-flex items-center bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                  <Tag className="h-3 w-3 mr-1" />
                  {category.name}
                </span>
              ))}
            </div>
          )}
          
          {/* Subcategories */}
          {business.subCategories && business.subCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {business.subCategories.map((subCategory: any) => (
                <span key={subCategory.id} className="inline-flex items-center bg-blue-50 text-blue-600 rounded-full px-3 py-1 text-xs font-medium">
                  <Tag className="h-3 w-3 mr-1" />
                  {subCategory.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}