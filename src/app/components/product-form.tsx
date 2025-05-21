'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createProductAction, updateProductAction } from '@/app/actions/product.action';
import { fetchSubCategoriesByCategory, createSubCategoryAction } from '@/app/actions/category.action';
import imageCompression from 'browser-image-compression';

interface ProductImage {
  id: string;
  url: string;
  productId: string;
}

interface ProductVideo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  productId: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  markupPercent: number;
  finalPrice: number;
  stock: number;
  isAvailable: boolean;
  businessId: string;
  categories: { id: string; name: string }[];
  subCategories: { id: string; name: string; categoryId: string }[];
  images?: ProductImage[];
  videos?: ProductVideo[];
}

interface Category {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

interface ImageError {
  main?: string;
  additional?: string;
  video?: string;
}

interface ImagePreview {
  url: string;
  file: File;
}

interface VideoPreview {
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
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState('');
  const [imageErrors, setImageErrors] = useState<ImageError>({});
  const [mainImagePreview, setMainImagePreview] = useState<ImagePreview | null>(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<ImagePreview[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<VideoPreview[]>([]);
  const [basePrice, setBasePrice] = useState<number>(product?.basePrice || 0);
  const [markupPercent, ] = useState<number>(product?.markupPercent || 15);
  const [finalPrice, setFinalPrice] = useState<number>(product?.finalPrice || 0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    product?.categories?.[0]?.id || ''
  );
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState<string[]>(
    product?.subCategories?.map(sc => sc.id) || []
  );
  const [newSubCategoryName, setNewSubCategoryName] = useState<string>('');
  const [showNewSubCategoryInput, setShowNewSubCategoryInput] = useState(false);
  const router = useRouter();

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB
  const MAX_ADDITIONAL_IMAGES = 6;
  const MAX_VIDEOS = 2;
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
  
  // Image compression options
  const compressionOptions = {
    maxSizeMB: 1,             // Max 1MB file size after compression
    maxWidthOrHeight: 1920,   // Resize to max 1920px width/height
    useWebWorker: true,       // Use Web Worker for better performance
    initialQuality: 0.8,      // Initial compression quality
  };

  useEffect(() => {
    // Calculate final price when basePrice or markupPercent changes
    const calculatedFinalPrice = basePrice * (1 + markupPercent / 100);
    setFinalPrice(calculatedFinalPrice);
  }, [basePrice, markupPercent]);

  useEffect(() => {
    // Fetch subcategories when a category is selected
    const fetchSubCategories = async () => {
      if (selectedCategoryId) {
        const result = await fetchSubCategoriesByCategory(selectedCategoryId);
        if (result.subCategories) {
          setSubCategories(result.subCategories);
        }
      }
    };

    fetchSubCategories();
  }, [selectedCategoryId]);

  const validateImage = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size too large. Maximum size is 5MB.';
    }
    return null;
  };

  const validateVideo = (file: File): string | null => {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return 'Invalid file type. Only MP4, WebM, and QuickTime videos are allowed.';
    }
    if (file.size > MAX_VIDEO_SIZE) {
      return 'File size too large. Maximum size is 20MB.';
    }
    return null;
  };

  const compressImage = async (file: File): Promise<File> => {
    try {
      return await imageCompression(file, compressionOptions);
    } catch (error) {
      console.error('Error compressing image:', error);
      return file; // Return original file if compression fails
    }
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

  const handleVideosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageErrors((prev) => ({ ...prev, video: undefined }));

    if (files.length > MAX_VIDEOS) {
      setImageErrors((prev) => ({ 
        ...prev, 
        video: `Maximum ${MAX_VIDEOS} videos allowed` 
      }));
      e.target.value = '';
      return;
    }

    const newPreviews: VideoPreview[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const error = validateVideo(file);
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
        video: errors.join('\n') 
      }));
      e.target.value = '';
      return;
    }

    setVideoPreviews(newPreviews);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    setSelectedCategoryId(categoryId);
    // Reset subcategories when category changes
    setSelectedSubCategoryIds([]);
  };

  const handleSubCategoryChange = (subCategoryId: string) => {
    setSelectedSubCategoryIds(prev => {
      if (prev.includes(subCategoryId)) {
        return prev.filter(id => id !== subCategoryId);
      } else {
        return [...prev, subCategoryId];
      }
    });
  };

  const handleAddNewSubCategory = async () => {
    if (!newSubCategoryName.trim() || !selectedCategoryId) return;
    
    setIsSubmitting(true);
    
    try {
      // Call the server action to create a new subcategory
      const result = await createSubCategoryAction(newSubCategoryName, selectedCategoryId);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      if (result.success && result.subcategory) {
        // Add the new subcategory to the list and select it
        setSubCategories(prev => [...prev, result.subcategory]);
        setSelectedSubCategoryIds(prev => [...prev, result.subcategory.id]);
        setNewSubCategoryName('');
        setShowNewSubCategoryInput(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create subcategory');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview.url);
      additionalImagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
      videoPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, [mainImagePreview, additionalImagePreviews, videoPreviews]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsCompressing(true);
    setError('');
    setImageErrors({});

    try {
      const formData = new FormData(e.currentTarget);
      
      // Set the base price and fixed markup percentage
      formData.set('basePrice', basePrice.toString());
      formData.set('markupPercent', markupPercent.toString());
      formData.set('finalPrice', finalPrice.toString());
      
      // Handle category IDs
      formData.delete('categoryIds');
      if (selectedCategoryId) {
        formData.append('categoryIds', selectedCategoryId);
      }
      
      // Handle subcategory IDs
      formData.delete('subCategoryIds');
      selectedSubCategoryIds.forEach(id => {
        formData.append('subCategoryIds', id);
      });
      
      // Compress and set the main image if available
      if (mainImagePreview?.file) {
        const compressedMainImage = await compressImage(mainImagePreview.file);
        formData.set('image', compressedMainImage);
      } else if (type === 'edit') {
        // Only include image field if there's a new image selected
        formData.delete('image');
        // Remove empty file inputs to prevent empty object serialization
        const imageInput = e.currentTarget.querySelector('input[name="image"]');
        if (imageInput && (imageInput as HTMLInputElement)?.files?.length === 0) {
          formData.delete('image');
        }
      }

      // Compress and set additional images if available
      if (additionalImagePreviews.length > 0) {
        // Remove existing 'images' entries from the FormData
        formData.delete('images');
        
        // Process each image
        const compressPromises = additionalImagePreviews.map(preview => 
          compressImage(preview.file)
        );
        
        // Wait for all images to be compressed
        const compressedImages = await Promise.all(compressPromises);
        
        // Add each compressed image to the FormData
        compressedImages.forEach(file => {
          formData.append('images', file);
        });
      } else {
        formData.delete('images');
      }

      // Handle videos (no compression)
      if (videoPreviews.length > 0) {
        // Remove existing 'videos' entries from the FormData
        formData.delete('videos');
        
        // Add each video to the FormData
        videoPreviews.forEach(preview => {
          formData.append('videos', preview.file);
        });
      } else {
        formData.delete('videos');
      }

      setIsCompressing(false);

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
      videoPreviews.forEach(preview => URL.revokeObjectURL(preview.url));

      if (type === 'create') {
        router.push(`/markets/${businessId}`);
      } else {
        router.push(`/products/${product!.id}`);
      }
    } catch (err: any) {
      setError('Something went wrong');
    } finally {
      setIsSubmitting(false);
      setIsCompressing(false);
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

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700">
            Base Price
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">₦</span>
            </div>
            <input
              type="number"
              name="basePrice"
              id="basePrice"
              step="100"
              min="0"
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              required
              className="block w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md bg-blue-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Price Information</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Based on your base price of <strong>₦{basePrice.toLocaleString()}</strong> and a markup of <strong>{markupPercent}%</strong>,
                the final price displayed to customers will be <strong>₦{finalPrice.toLocaleString()}</strong>
              </p>
              <p className="mt-1 text-xs">
                Note: The standard markup percentage is typically 15% for products on the platform. 
                For existing products, your current markup percentage is shown.
              </p>
            </div>
          </div>
        </div>
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

      <div>
        <label htmlFor="categoryIds" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          name="categoryIds"
          id="categoryIds"
          value={selectedCategoryId}
          onChange={handleCategoryChange}
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

      {selectedCategoryId && (
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategories for selected category
            </label>
            
            <div className="space-y-2">
              {subCategories.length > 0 ? (
                subCategories.map(subCategory => (
                  <div key={subCategory.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`subcat-${subCategory.id}`}
                      checked={selectedSubCategoryIds.includes(subCategory.id)}
                      onChange={() => handleSubCategoryChange(subCategory.id)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor={`subcat-${subCategory.id}`} className="ml-2 block text-sm text-gray-700">
                      {subCategory.name}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No subcategories available for this category</p>
              )}
            </div>
          </div>
          
          <div className="pt-2 mt-2 border-t border-gray-200">
            <p className="text-sm text-gray-700 mb-2">Don't see what you're looking for? Add a new subcategory:</p>
            
            {showNewSubCategoryInput ? (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newSubCategoryName}
                    onChange={(e) => setNewSubCategoryName(e.target.value)}
                    placeholder="Enter new subcategory name"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewSubCategory}
                    disabled={isSubmitting || !newSubCategoryName.trim()}
                    className="inline-flex items-center rounded-md border border-transparent bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Adding...' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewSubCategoryInput(false);
                      setNewSubCategoryName('');
                    }}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
                {error && error.includes('subcategory') && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewSubCategoryInput(true)}
                className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
              >
                + Add new subcategory
              </button>
            )}
          </div>
        </div>
      )}

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
        <p className="mt-1 text-xs text-gray-500">
          Images will be automatically compressed to ensure fast uploads. Max size: 5MB. Supported formats: JPEG, PNG, WebP.
        </p>
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

      {/* New video upload section */}
      <div>
        <label htmlFor="videos" className="block text-sm font-medium text-gray-700">
          Product Videos
        </label>
        <input
          type="file"
          name="videos"
          id="videos"
          accept="video/mp4,video/webm,video/quicktime"
          multiple
          onChange={handleVideosChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
        />
        <p className="mt-1 text-xs text-gray-500">
          Upload videos to showcase your product in action. Max size: 20MB. Supported formats: MP4, WebM, QuickTime. 
          Maximum {MAX_VIDEOS} videos allowed.
        </p>
        {imageErrors.video && (
          <p className="mt-2 text-sm text-red-600 whitespace-pre-line">{imageErrors.video}</p>
        )}
        {videoPreviews.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">Video Previews:</p>
            <div className="mt-2 grid grid-cols-2 gap-4">
              {videoPreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <video 
                    src={preview.url} 
                    controls 
                    className="h-40 w-full rounded-md object-cover"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <p className="mt-1 text-xs text-gray-500 truncate">{preview.file.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {type === 'edit' && product?.videos && product.videos.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">Current videos:</p>
            <div className="mt-2 grid grid-cols-2 gap-4">
              {product.videos.map((video) => (
                <div key={video.id} className="relative">
                  <video 
                    src={video.url} 
                    controls 
                    className="h-40 w-full rounded-md object-cover"
                  >
                    Your browser does not support the video tag.
                  </video>
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
          {isSubmitting ? 
            (isCompressing ? 'Compressing Images...' : 'Saving...') : 
            (type === 'create' ? 'Create Product' : 'Update Product')
          }
        </button>
      </div>
    </form>
  );
}