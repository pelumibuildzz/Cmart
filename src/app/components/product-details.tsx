'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Trash2, Edit, Store } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart';
import { deleteProductAction } from '@/app/actions/product.action';

interface ProductDetailsProps {
  product: any; // Replace with proper type
  onDelete?: () => void;
}

export default function ProductDetails({ product, onDelete }: ProductDetailsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session } = useSession();
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);

  const isOwner = session?.user?.id === product.Business.userId;
  const currentCartQuantity = items.find(item => item.id === product.id)?.quantity || 0;
  const isOutOfStock = product.stock <= currentCartQuantity;

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
        router.push(`/markets/${product.Business.id}`);
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
      price: product.price, 
      imageUrl: product.imageUrl,
      businessId: product.Business.id,
      stock: product.stock
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      <div className="relative aspect-video w-full max-h-[500px]">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-secondary">{product.name}</h1>
          <div className="text-2xl font-bold text-primary">
            ₦{product.price.toFixed(2)}
          </div>
        </div>

        <Link 
          href={`/markets/${product.Business.id}`}
          className="inline-flex items-center text-secondary hover:text-primary mb-4"
        >
          <Store className="h-4 w-4 mr-2" />
          {product.Business.name}
        </Link>

        <p className="text-gray-600 mb-6">{product.description}</p>

        <div className="flex justify-between items-center mb-6">
          <div className="text-sm">
            <span className="font-medium">Stock:</span>{' '}
            <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
              {product.stock} available
            </span>
          </div>
          {currentCartQuantity > 0 && (
            <div className="text-sm text-primary">
              {currentCartQuantity} in cart
            </div>
          )}
        </div>

        {/* Additional Images */}
        {product.images && product.images.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Additional Images</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {product.images.map((image: any) => (
                <div key={image.id} className="relative aspect-square w-full max-w-[150px]">
                  <Image
                    src={image.url}
                    alt={`Additional view of ${product.name}`}
                    fill
                    className="object-cover rounded-md"
                    sizes="(max-width: 768px) 50vw, 150px"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          {isOwner ? (
            <>
              <Link
                href={`/business/product/${product.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!product.isAvailable || isOutOfStock}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md text-base font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
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
  );
}