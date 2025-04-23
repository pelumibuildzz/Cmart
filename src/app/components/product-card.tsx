'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { ProductImage } from '@/types/product';
import Link from 'next/link';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  images: ProductImage[];
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  imageUrl,
  images,
}: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const allImages = [{ url: imageUrl }, ...images];

  const handleSlideChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <Link
    href={`/products/${id}`}
    >
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Product Images Slider */}
        <div className="relative aspect-square group">
            <div className="relative w-full h-full overflow-hidden">
            <Image
                src={allImages[currentImageIndex].url}
                alt={`${name} - Image ${currentImageIndex + 1}`}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
            />
            </div>
            
            {/* Slider Controls */}
            {allImages.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                {allImages.map((_, index) => (
                <button
                    key={index}
                    onClick={() => handleSlideChange(index)}
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
                ${price.toFixed(2)}
            </span>
            <button 
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                onClick={() => {
                // TODO: Implement add to cart functionality
                console.log('Add to cart:', id);
                }}
            >
                <ShoppingCart size={20} />
                Add to Cart
            </button>
            </div>
        </div>
        </div>    
    </Link>
  );
}