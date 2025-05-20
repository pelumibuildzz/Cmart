'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ShoppingCart, Check, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductImage } from '@/types/product';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/store/cart';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatPrice } from '@/lib/utils/format';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  images: ProductImage[];
  stock: number;
  businessId: string;
  categories?: { id: string; name: string }[];
  subCategories?: { id: string; name: string }[];
  isAvailable?: boolean;
  isOwner?: boolean;
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
  categories,
  subCategories,
  isAvailable = true,
  isOwner = false,
}: ProductCardProps) {  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const slideshowIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const allImages = [{ url: imageUrl }, ...images];
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const router = useRouter();
  const { data: session } = useSession();

  const currentCartQuantity = items.find(item => item.id === id)?.quantity || 0;
  const isOutOfStock = stock <= currentCartQuantity || !isAvailable;  // Set up automatic slideshow
  useEffect(() => {
    // Only set up slideshow if there are multiple images
    if (allImages.length > 1) {
      slideshowIntervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change image every 3 seconds
    }

    // Clean up interval on component unmount
    return () => {
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
        slideshowIntervalRef.current = null;
      }
    };
  }, [allImages.length]);
  const handleSlideChange = (index: number) => {
    setCurrentImageIndex(index);
    // Reset the slideshow timer when manually changing slides
    if (slideshowIntervalRef.current) {
      clearInterval(slideshowIntervalRef.current);
      slideshowIntervalRef.current = null;
    }
    
    // Restart the slideshow
    if (allImages.length > 1) {
      slideshowIntervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 8000);
    }
  };
  const togglePause = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    let count = 0;
    if(items.map((i) => {
      if (i.id == id){
        count = count + 1
      }
    }))
    if(count == 0 && items.length == 2){
      alert("Just a heads up! We're currently limiting carts to 2 items. Thanks for understanding! 😊")
      setIsAdding(false)
    }

    // Reset animation after 1.5 seconds
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  return (
    <Link href={`/products/${id}`} >
      <div className={`bg-white rounded-lg shadow-md overflow-hidden ${!isAvailable && 'relative opacity-80'}`}>
        {/* Unavailable Overlay for Owner */}
        {!isAvailable && isOwner && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-30 z-10 flex flex-col items-center justify-center">
            <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-md">
              Unavailable
            </span>
            <span className="mt-2 text-white text-xs px-2 py-1 bg-black bg-opacity-50 rounded">
              Only visible to you
            </span>
          </div>
        )}        {/* Product Images Slider */}
        <div className="relative aspect-square group">
          <div className="relative w-full h-full overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentImageIndex}
                initial={{ opacity: .2 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: .1}}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative w-full h-full"
              >
                <Image
                  src={allImages[currentImageIndex].url}
                  alt={`${name} - Image ${currentImageIndex + 1}`}
                  className={`object-cover group-hover:scale-105 transition-transform duration-300 ${!isAvailable && 'grayscale'}`}
                  fill
                  sizes="100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Stock Badge */}
          {(stock <= 5 || !isAvailable) && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded z-20">
              {!isAvailable ? 'Unavailable' : stock === 0 ? 'Out of Stock' : `Only ${stock} left`}
            </div>
          )}
          
          {/* Category Badge - Show first category if available */}
          {categories && categories.length > 0 && (
            <div className="absolute top-2 left-2 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded flex items-center">
              <Tag className="h-3 w-3 mr-1" />
              {categories[0].name}
            </div>
          )}
            {/* Slider Controls */}
          {allImages.length > 1 && (
            <>
              {/* Navigation Arrows */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const newIndex = currentImageIndex === 0 ? allImages.length - 1 : currentImageIndex - 1;
                    handleSlideChange(newIndex);
                  }}
                  className="bg-white/80 rounded-full p-1 text-gray-800 shadow-md"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const newIndex = currentImageIndex === allImages.length - 1 ? 0 : currentImageIndex + 1;
                    handleSlideChange(newIndex);
                  }}
                  className="bg-white/80 rounded-full p-1 text-gray-800 shadow-md"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </div>
              
              {/* Dot Indicators */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                {allImages.map((_, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.2 }}
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
            </>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-secondary mb-2">
            {name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-[50px] overflow-auto">
            {description}
          </p>
          <div className="flex items-center justify-between">            <span className="text-xl font-bold text-primary">
              {formatPrice(price)}
            </span>
            <motion.button 
              whileHover={!isOutOfStock && !isAdding ? { scale: 1.05 } : {}}
              whileTap={!isOutOfStock && !isAdding ? { scale: 0.95 } : {}}
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
              {!isAvailable ? (
                'Unavailable'
              ) : isOutOfStock ? (
                'Out of Stock'
              ) : isAdding ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <Check className="h-5 w-5" />
                  </motion.div>
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>    
    </Link>
  );
}