import { getCurrentUser } from '@/lib/auth/session';
import { getCategoryById } from '@/lib/services/category.service';
import { getBusinesses } from '@/lib/services';
import { MapPin } from 'lucide-react';
import BusinessCard from '@/app/components/business-card';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: {
    categoryId: string;
  };
}

export default async function CategoryDetails({ params }: CategoryPageProps) {
  const currentUser = await getCurrentUser();
  const category = await getCategoryById(params.categoryId);
  
  if (!category) {
    notFound();
  }

  const businesses = await getBusinesses({
    where: {
      categoryId: params.categoryId
    }
  });

  // Group businesses by university
  const businessesByUniversity = businesses.reduce((acc: { [key: string]: any[] }, business) => {
    const universityId = business.universityId;
    if (!acc[universityId]) {
      acc[universityId] = [];
    }
    acc[universityId].push(business);
    return acc;
  }, {});

  // Get user's university businesses first
  const userUniversityBusinesses = currentUser ? businessesByUniversity[currentUser.universityId] || [] : [];
  const otherUniversitiesBusinesses = Object.entries(businessesByUniversity)
    .filter(([universityId]) => !currentUser || universityId !== currentUser.universityId)
    .map(([_, businesses]) => businesses)
    .flat();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-secondary mb-2">{category.name}</h1>
      <p className="text-gray-600 mb-8">Discover {category.name.toLowerCase()} businesses in your university and beyond</p>
      
      {/* User's University Businesses */}
      {currentUser && userUniversityBusinesses.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-secondary mb-4 flex items-center">
            <MapPin className="mr-2 text-primary" />
            Your University
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userUniversityBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </div>
      )}

      {/* Other Universities' Businesses */}
      {otherUniversitiesBusinesses.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-secondary mb-4 flex items-center">
            <MapPin className="mr-2 text-primary" />
            Other Universities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherUniversitiesBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </div>
      )}

      {businesses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No businesses found in this category yet.
          </p>
        </div>
      )}
    </div>
  );
}

