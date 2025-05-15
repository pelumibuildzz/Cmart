import { getCurrentUser } from '@/lib/auth/session';
import { getCategoryById, getProductsByCategoryId } from '@/lib/services/category.service';
import { MapPin, Tag } from 'lucide-react';
import BusinessCard from '@/app/components/business-card';
import ProductCard from '@/app/components/product-card';
import { notFound } from 'next/navigation';
import Link from 'next/link';


export default async function CategoryDetails({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  const currentUser = await getCurrentUser();
  const category = await getCategoryById(categoryId);
  
  if (!category) {
    notFound();
  }

  // Get category products
  const products = await getProductsByCategoryId(categoryId);

  // Get businesses from the category relationship
  const businesses = category.businesses || [];

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
      <p className="text-gray-600 mb-4">Discover {category.name.toLowerCase()} businesses in your university and beyond</p>
      
      {/* Subcategories */}
      {category.subCategories && category.subCategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-secondary mb-2">Subcategories</h2>
          <div className="flex flex-wrap gap-3">
            {category.subCategories.map((subCategory) => (
              <Link 
                key={subCategory.id} 
                // href={`/category/${category.id}/subcategory/${subCategory.id}`}
                href={`/category/${category.id}`}
                className="inline-flex items-center bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full"
              >
                <Tag className="h-4 w-4 mr-2 text-primary" />
                {subCategory.name}
              </Link>
            ))}
          </div>
        </div>
      )}
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
      
      {/* Products for this category */}
      {products.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-secondary mb-4">
            Products in {category.name}
          </h2>
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
        </div>
      )}
      

      {businesses.length === 0 && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No content found in this category yet.
          </p>
        </div>
      )}
    </div>
  );
}

