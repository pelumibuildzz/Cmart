import { getCurrentUser } from '@/lib/auth/session';
import { getBusinesses } from '@/lib/services';
import { getUniversities } from '@/lib/services/university.service';
import { MapPin } from 'lucide-react';
import BusinessCard from '../components/business-card';

export default async function Markets() {
  const currentUser = await getCurrentUser();
  const universities = await getUniversities();
  const businesses = await getBusinesses();

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
  const otherUniversitiesBusinesses = universities
    .filter(uni => !currentUser || uni.id !== currentUser.universityId)
    .map(uni => ({
      university: uni,
      businesses: businessesByUniversity[uni.id] || []
    }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-secondary mb-8">Markets</h1>
      
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

      {/* Other Universities */}
      <div className="space-y-12">
        {otherUniversitiesBusinesses.map(({ university, businesses }) => (
          businesses.length > 0 && (
            <div key={university.id}>
              <h2 className="text-2xl font-semibold text-secondary mb-4 flex items-center">
                <MapPin className="mr-2 text-primary" />
                {university.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

