'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Business } from '@/types/business';
import { updateBusinessProfileAction, updateBusinessImageAction } from '@/app/actions/business.action';
import { Upload, X, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BusinessProfileClientProps {
  business: Business;
  categories: { id: string; name: string }[];
}

export default function BusinessProfileClient({ business, categories }: BusinessProfileClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: business.name,
    description: business.description,
    bankName: business.bankName || '',
    accountNumber: business.accountNumber || '',
  });
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    business.categories.map(cat => cat.id)
  );
  
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(business.imageUrl || null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryIds(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;    // Validate file
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error("Maximum file size is 5MB.");
      return;
    }
    
    // Reset upload success state
    setUploadSuccess(false);
    
    // Clean up any previous object URL if one was created
    if (imagePreview && imagePreview !== business.imageUrl) {
      URL.revokeObjectURL(imagePreview);
    }    // Set the new image file
    setImageFile(file);
    
    // Create a new object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };
  
  const handleRemoveImage = () => {
    // Clean up the temporary object URL if one was created
    if (imageFile && imagePreview && imagePreview !== business.imageUrl) {
      URL.revokeObjectURL(imagePreview);
    }
    
    // Reset the image file
    setImageFile(null);
    
    // Set preview back to the original business image or null
    setImagePreview(business.imageUrl || null);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };  const handleImageUpload = async () => {
    if (!imageFile) return;

    setImageLoading(true);
    setUploadSuccess(false);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      console.log('Uploading image:', {
        fileName: imageFile.name,
        fileSize: imageFile.size,
        fileType: imageFile.type
      });

      const result = await updateBusinessImageAction(formData);
      
      console.log('Upload result:', result);

      if (result.error) {
        console.error('Upload error from server:', result.error);
        toast.error(result.error);
        return;
      }

      // Successfully uploaded the image
      setUploadSuccess(true);
      toast.success("Business image updated successfully");
      
      // Clean up the temporary object URL before refreshing
      if (imagePreview && imagePreview !== business.imageUrl) {
        URL.revokeObjectURL(imagePreview);
      }
      
      // Reset the image file since it's been uploaded
      setImageFile(null);
      
      // Refresh the page to show the updated image
      router.refresh();
    } catch (error) {
      console.error('Client-side upload error:', error);
      toast.error(`Failed to update business image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCategoryIds.length === 0) {
      setError('Please select at least one business category');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('name', formData.name);
      formDataToSubmit.append('description', formData.description);
      formDataToSubmit.append('bankName', formData.bankName);
      formDataToSubmit.append('accountNumber', formData.accountNumber);
      
      selectedCategoryIds.forEach(id => {
        formDataToSubmit.append('categoryIds', id);
      });
      
      const result = await updateBusinessProfileAction(formDataToSubmit);
      
      if (result.error) {
        setError(result.error);
        return;
      }      
      toast.success("Business profile updated successfully");
      
      router.refresh();
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-secondary">Business Profile</h1>
          </div>
          
          {/* Profile Image Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-secondary mb-4">Profile Image</h2>
            
            <div className="flex items-start gap-6">              <div 
                className="relative w-32 h-32 rounded-lg border border-gray-300 overflow-hidden cursor-pointer group"
                onClick={handleImageClick}
              >
                {imagePreview ? (
                  <>                    
                    <Image 
                      src={imagePreview} 
                      alt={business.name} 
                      fill 
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="space-y-3 flex-1">
                <input 
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                <p className="text-sm text-gray-600">
                  Upload a profile image for your business. This will be displayed to customers when they browse your products.
                </p>
                  <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={!imageFile || imageLoading}
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white ${uploadSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary/90'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50`}
                  >
                    {imageLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : uploadSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Uploaded
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </>
                    )}
                  </button>
                  
                  {imageFile && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={imageLoading}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Business Details Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  id="bankName"
                  name="bankName"
                  type="text"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                  placeholder="Enter your bank name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  id="accountNumber"
                  name="accountNumber"
                  type="text"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                  placeholder="Enter your account number"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Categories
                </label>
                <div className="space-y-2 border border-gray-300 rounded-md p-3">
                  <p className="text-sm text-gray-600 mb-2">
                    Select all categories that apply to your business
                  </p>
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        checked={selectedCategoryIds.includes(category.id)}
                        onChange={() => handleCategoryChange(category.id)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        disabled={isLoading}
                      />
                      <label htmlFor={`category-${category.id}`} className="ml-2 block text-sm text-gray-700">
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
