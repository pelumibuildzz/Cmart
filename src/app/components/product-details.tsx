'use client';

import Image from "next/image"
import { useState } from "react"
import { useCartStore } from "@/lib/store/cart"
import { Check, ShoppingCart } from "lucide-react"

interface ProductDetailsProps {
  product: any;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);

  const currentCartQuantity = items.find(item => item.id === product.id)?.quantity || 0;
  const isOutOfStock = product.stock <= currentCartQuantity;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    setIsAdding(true);
    addItem({ 
      id: product.id, 
      name: product.name, 
      price: product.price, 
      imageUrl: product.imageUrl,
      businessId: product.Business.id,
      stock: product.stock
    });

    // Reset animation after 1.5 seconds
    setTimeout(() => {
      setIsAdding(false);
    }, 1500);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images Section */}
        <div className="space-y-4">
          <div className="relative h-[400px] bg-card rounded-lg overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain"
              priority
            />
          </div>
          
          {/* Additional Images */}
          {product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image: any) => (
                <div key={image.id} className="relative h-24 bg-card rounded-lg overflow-hidden">
                  <Image
                    src={image.url}
                    alt={`${product.name} additional view`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
            <p className="text-2xl font-semibold text-primary">
              ${product.price.toFixed(2)}
            </p>
          </div>

          {/* Business Info */}
          <div className="py-2">
            <p className="text-sm text-muted-foreground">Sold by</p>
            <p className="font-medium">{product.Business.name}</p>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Description */}
          <div className="prose prose-slate max-w-none">
            <h2 className="text-lg font-semibold">About this product</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
          </div>

          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            disabled={!product.isAvailable || isOutOfStock || isAdding}
            className={`w-full md:w-auto px-6 py-3 rounded-md transition-all duration-300 flex items-center justify-center gap-2
              ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : isAdding ? 'bg-green-500' : 'bg-primary hover:bg-primary/90'} 
              text-white disabled:opacity-50 disabled:cursor-not-allowed`}
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
    </main>
  );
}