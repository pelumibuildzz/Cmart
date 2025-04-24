'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createProductAction, updateProductAction } from '@/app/actions/product.action';

interface ProductImage {
  id: string;
  url: string;
  productId: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  businessId: string;
  categoryId: string;
  images?: ProductImage[];
}

interface Category {
  id: string;
  name: string;
}

interface ImageError {
  main?: string;
  additional?: string;
}

interface ImagePreview {
  url: string;
  file: File;
}

interface ProductFormProps {
  type: 'create' | 'edit';
  product?: Product;
  businessId?: string;
  categories: Category[];
}

export default function ProductForm({ type, product, businessId, categories }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageErrors, setImageErrors] = useState<ImageError>({});
  const [mainImagePreview, setMainImagePreview] = useState<ImagePreview | null>(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<ImagePreview[]>([]);
  const router = useRouter();

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_ADDITIONAL_IMAGES = 5;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const validateImage = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size too large. Maximum size is 5MB.';
    }
    return null;
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageErrors((prev) => ({ ...prev, main: undefined }));
    
    if (file) {
      const error = validateImage(file);
      if (error) {
        setImageErrors((prev) => ({ ...prev, main: error }));
        e.target.value = '';
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setMainImagePreview({ url: previewUrl, file });
    } else {
      setMainImagePreview(null);
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageErrors((prev) => ({ ...prev, additional: undefined }));

    if (files.length > MAX_ADDITIONAL_IMAGES) {
      setImageErrors((prev) => ({ 
        ...prev, 
        additional: `Maximum ${MAX_ADDITIONAL_IMAGES} additional images allowed` 
      }));
      e.target.value = '';
      return;
    }

    const newPreviews: ImagePreview[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const error = validateImage(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        newPreviews.push({
          url: URL.createObjectURL(file),
          file
        });
      }
    });

    if (errors.length) {
      setImageErrors((prev) => ({ 
        ...prev, 
        additional: errors.join('\n') 
      }));
      e.target.value = '';
      return;
    }

    setAdditionalImagePreviews(newPreviews);
  };

  useEffect(() => {
    return () => {
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview.url);
      additionalImagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, [mainImagePreview, additionalImagePreviews]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setImageErrors({});

    try {
      const formData = new FormData(e.currentTarget);
      
      // Only include image field if there's a new image selected
      if (type === 'edit') {
        if (!mainImagePreview) {
          formData.delete('image');
        }
        // Remove empty file inputs to prevent empty object serialization
        const imageInput = e.currentTarget.querySelector('input[name="image"]') as HTMLInputElement;
        if (imageInput && !imageInput.files?.length) {
          formData.delete('image');
        }
      }

      // Only include additional images if new ones are selected
      const imagesInput = e.currentTarget.querySelector('input[name="images"]') as HTMLInputElement;
      if (!imagesInput?.files?.length) {
        formData.delete('images');
      }

      const result = type === 'create' 
        ? await createProductAction(formData)
        : await updateProductAction(product!.id, formData);

      if (result.error) {
        if (result.error.includes('image')) {
          setImageErrors({ main: result.error });
        } else {
          setError(result.error);
        }
        return;
      }

      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview.url);
      additionalImagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));

      if (type === 'create') {
        router.push(`/markets/${businessId}`);
      } else {
        router.push(`/products/${product!.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Product Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          defaultValue={product?.name}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={4}
          defaultValue={product?.description}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">₦</span>
            </div>
            <input
              type="number"
              name="price"
              id="price"
              step="1000"
              min="0"
              defaultValue={product?.price}
              required
              className="block w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>Actual Price displayed will be {}</div>
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
            Stock
          </label>
          <input
            type="number"
            name="stock"
            id="stock"
            min="0"
            defaultValue={product?.stock}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          name="categoryId"
          id="categoryId"
          defaultValue={product?.categoryId}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Main Image
        </label>
        <input
          type="file"
          name="image"
          id="image"
          accept="image/*"
          required={type === 'create'}
          onChange={handleMainImageChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
        />
        {imageErrors.main && (
          <p className="mt-2 text-sm text-red-600">{imageErrors.main}</p>
        )}
        {mainImagePreview && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">Preview:</p>
            <div className="relative mt-2 h-32 w-32">
              <Image
                src={mainImagePreview.url}
                alt="Main image preview"
                fill
                className="rounded-md object-cover"
              />
            </div>
          </div>
        )}
        {type === 'edit' && product?.imageUrl && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">Current image:</p>
            <div className="relative mt-2 h-32 w-32">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="rounded-md object-cover"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="images" className="block text-sm font-medium text-gray-700">
          Additional Images
        </label>
        <input
          type="file"
          name="images"
          id="images"
          accept="image/*"
          multiple
          onChange={handleAdditionalImagesChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
        />
        {imageErrors.additional && (
          <p className="mt-2 text-sm text-red-600 whitespace-pre-line">{imageErrors.additional}</p>
        )}
        {additionalImagePreviews.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">Previews:</p>
            <div className="mt-2 grid grid-cols-3 gap-4">
              {additionalImagePreviews.map((preview, index) => (
                <div key={index} className="relative h-24 w-24">
                  <Image
                    src={preview.url}
                    alt={`Additional image preview ${index + 1}`}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        {type === 'edit' && product?.images && product.images.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">Current additional images:</p>
            <div className="mt-2 grid grid-cols-3 gap-4">
              {product.images.map((image) => (
                <div key={image.id} className="relative h-24 w-24">
                  <Image
                    src={image.url}
                    alt={`Additional view of ${product.name}`}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center">
          <input
          type="checkbox"
          name="isAvailable"
          id="isAvailable"
          value="true"
          defaultChecked={product?.isAvailable}
          />
          <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
            Product is available for purchase
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : type === 'create' ? 'Create Product' : 'Update Product'}
        </button>
      </div>
    </form>
  );
}