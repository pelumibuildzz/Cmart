'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Trash2, Edit, Store, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart';
import { deleteProductAction } from '@/app/actions/product.action';
import { formatPrice } from '@/lib/utils/format';

interface ProductDetailsProps {
  product: any; // Replace with proper type
  onDelete?: () => void;
  isOwner?: boolean;
}

export default function ProductDetails({ product, onDelete, isOwner }: ProductDetailsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();
  const { data: session } = useSession();
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);

  // Use passed isOwner prop if available, otherwise determine from session
  const isProductOwner = isOwner !== undefined ? isOwner : session?.user?.id === product.business.userId;
  const currentCartQuantity = items.find(item => item.id === product.id)?.quantity || 0;
  const isOutOfStock = product.stock <= currentCartQuantity || !product.isAvailable;

  // Prepare images array for the slideshow
  const allImages = [
    { id: 'main', url: product.imageUrl },
    ...(product.images || [])
  ];

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const result = await deleteProductAction(product.id);
      
      if (result.error) {
        setError(result.error);
        return;
      }

      // Call onDelete callback if provided
      if (onDelete) {
        onDelete();
      } else {
        // Otherwise, redirect to business page
        router.push(`/markets/${product.business.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddToCart = () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (isOutOfStock) return;
    
    addItem({ 
      id: product.id, 
      name: product.name, 
      price: product.finalPrice, 
      imageUrl: product.imageUrl,
      businessId: product.business.id,
      stock: product.stock
    });

    let count = 0;
    if(items.map((i) => {
      if (i.id == product.id){
        count = count + 1
      }
    }))
    if(count == 0 && items.length == 2){
      alert("Just a heads up! We're currently limiting carts to 2 items. Thanks for understanding! 😊")
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {/* Unavailable Product Banner */}
      {!product.isAvailable && isProductOwner && (
        <div className="bg-red-500 text-white px-4 py-3 text-center">
          <span className="font-medium">This product is unavailable and only visible to you.</span>
        </div>
      )}

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* Left Column - Image Gallery */}
          <div className="w-full">
            <div className="relative aspect-square w-full mb-3">
              <Image
                src={allImages[currentImageIndex].url}
                alt={product.name}
                fill
                className={`object-contain rounded-md ${!product.isAvailable ? 'opacity-70 grayscale' : ''}`}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {!product.isAvailable && (
                <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-md font-medium text-sm">
                  Unavailable
                </div>
              )}
              
              {allImages.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -mt-5 bg-white/90 rounded-full p-2 shadow-md hover:bg-white transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-800" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -mt-5 bg-white/90 rounded-full p-2 shadow-md hover:bg-white transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-800" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-1.5">
                {allImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square w-full border-2 rounded-md overflow-hidden transition-all ${
                      index === currentImageIndex ? 'border-primary scale-95 shadow-sm' : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`Product thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 20vw, 100px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Right Column - Product Information */}
          <div className="flex flex-col">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-secondary mb-1">{product.name}</h1>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(product.finalPrice)}
                </span>
                
                <div className="flex items-center text-sm">
                  <span className={`inline-flex items-center ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        In Stock ({product.stock})
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </span>
                  
                  {currentCartQuantity > 0 && (
                    <span className="bg-primary/10 text-primary text-xs font-medium ml-2 px-2 py-0.5 rounded-full">
                      {currentCartQuantity} in cart
                    </span>
                  )}
                </div>
              </div>
              
              <Link 
                href={`/markets/${product.business.id}`}
                className="inline-flex items-center text-secondary hover:text-primary mb-4 text-sm"
              >
                <Store className="h-4 w-4 mr-1.5" />
                {product.business.name}
              </Link>
            </div>

            {/* Categories and Subcategories */}
            {(product.categories.length > 0 || product.subCategories.length > 0) && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {product.categories.map((category: any) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.id}`}
                    className="inline-flex items-center text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {category.name}
                  </Link>
                ))}
                {product.subCategories.map((subCategory: any) => (
                  <Link
                    key={subCategory.id}
                    href={`/category/${subCategory.categoryId}`}
                    className="inline-flex items-center text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-full"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {subCategory.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Product Description - Summary */}
            <div className="mb-6">
              <p className="text-gray-600 line-clamp-3 text-sm">
                {product.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="">
              {isProductOwner ? (
                <div className="flex gap-3">
                  <Link
                    href={`/business/product/${product.id}/edit`}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={!product.isAvailable || isOutOfStock}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md text-base font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 shadow-sm transition-colors"
                >
                  {!product.isAvailable
                    ? 'Not Available'
                    : isOutOfStock
                    ? 'Out of Stock'
                    : 'Add to Cart'}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Full Description Section - Below Both Columns */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-3">Product Description</h2>
          <div className="text-gray-600 prose prose-sm max-w-none">
            <p className="whitespace-pre-line">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}