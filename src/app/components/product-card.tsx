'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Check } from 'lucide-react';
import { ProductImage } from '@/types/product';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  images: ProductImage[];
  stock: number;
  businessId: string;
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  imageUrl,
  images,
  stock,
  businessId,
}: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const allImages = [{ url: imageUrl }, ...images];
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const router = useRouter();
  const { data: session } = useSession();

  const currentCartQuantity = items.find(item => item.id === id)?.quantity || 0;
  const isOutOfStock = stock <= currentCartQuantity;

  const handleSlideChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (isOutOfStock) return;
    
    setIsAdding(true);
    addItem({ 
      id, 
      name, 
      price, 
      imageUrl,
      businessId,
      stock
    });

    // Reset animation after 1.5 seconds
    setTimeout(() => {
      setIsAdding(false);
    }, 1500);
  };

  return (
    <Link href={`/products/${id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Product Images Slider */}
        <div className="relative aspect-square group">
          <div className="relative w-full h-full overflow-hidden">
            <Image
              src={allImages[currentImageIndex].url}
              alt={`${name} - Image ${currentImageIndex + 1}`}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              fill
              sizes="100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </div>
          
          {/* Stock Badge */}
          {stock <= 5 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              {stock === 0 ? 'Out of Stock' : `Only ${stock} left`}
            </div>
          )}
          
          {/* Slider Controls */}
          {allImages.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSlideChange(index);
                  }}
                  className={`w-2 h-2 rounded-full bg-white transition-opacity ${
                    currentImageIndex === index ? 'opacity-75' : 'opacity-50 hover:opacity-75'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-secondary mb-2">
            {name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">
              ₦{price.toFixed(2)}
            </span>
            <button 
              className={`flex items-center gap-2 ${
                isOutOfStock 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isAdding 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-primary hover:bg-primary/90'
              } text-white px-4 py-2 rounded-md transition-all duration-300`}
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
            >
              {isOutOfStock ? (
                'Out of Stock'
              ) : isAdding ? (
                <>
                  <Check className="h-5 w-5" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>    
    </Link>
  );
}