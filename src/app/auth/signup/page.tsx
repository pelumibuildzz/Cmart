'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { University, Category, SubCategory } from '@prisma/client';
import { fetchUniversities, createUniversityAction } from '@/app/actions/university.action';
import { fetchCategories, fetchSubCategoriesByCategory, createSubCategoryAction } from '@/app/actions/category.action';
import { Role } from '@/lib/constants';
import { Upload, X, Plus } from 'lucide-react';

export default function SignUp() {
  const router = useRouter();  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    universityId: '',
    role: Role.USER,
    businessName: '',
    businessDescription: '',
    bankName: '',
    accountNumber: '',
  });
  const [universities, setUniversities] = useState<University[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState<string[]>([]);
  const [businessImage, setBusinessImage] = useState<File | null>(null);
  const [businessImagePreview, setBusinessImagePreview] = useState<string | null>(null);  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [showNewUniversityInput, setShowNewUniversityInput] = useState(false);
  const [newUniversityName, setNewUniversityName] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setIsFetchingData(true);
      try {
        const [universitiesResult, categoriesResult] = await Promise.all([
          fetchUniversities(),
          fetchCategories()
        ]);

        if (universitiesResult.error) {
          throw new Error(universitiesResult.error);
        }

        if (categoriesResult.error) {
          throw new Error(categoriesResult.error);
        }

        if (universitiesResult.universities) {
          setUniversities(universitiesResult.universities);
        }

        if (categoriesResult.categories) {
          setCategories(categoriesResult.categories);
        }
      } catch (err: any) {
        setError('Could not load required data. Please try again later.');
        console.error(err);
      } finally {
        setIsFetchingData(false);
      }
    };
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryIds(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      const { name, email, phoneNumber, password, confirmPassword, universityId, role, businessName, businessDescription, bankName, accountNumber } = formData;
    
    if (!name || !email || !phoneNumber || !password || !confirmPassword || !universityId) {
      setError('Please fill in all required fields');
      return;
    }

    if (role === Role.BUSINESS) {
      if (!businessName || !businessDescription) {
        setError('Please fill in all business details');
        return;
      }
      
      if (selectedCategoryIds.length === 0) {
        setError('Please select at least one business category');
        return;
      }
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
    // Create FormData if we have a business image
      if (role === Role.BUSINESS && businessImage) {        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('phoneNumber', phoneNumber);
        formData.append('password', password);
        formData.append('universityId', universityId);
        formData.append('role', role);
        formData.append('businessName', businessName);
        formData.append('businessDescription', businessDescription);
        
        // Add bank details
        if (bankName) formData.append('bankName', bankName);
        if (accountNumber) formData.append('accountNumber', accountNumber);
        
        // Add the business image
        formData.append('businessImage', businessImage);
        
        // Add category and subcategory IDs
        selectedCategoryIds.forEach(id => {
          formData.append('categoryIds', id);
        });
        
        if (selectedSubCategoryIds.length > 0) {
          selectedSubCategoryIds.forEach(id => {
            formData.append('subCategoryIds', id);
          });
        }

        // Use the API route to handle the signup with image
        const response = await fetch('/api/auth/signup-with-image', {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Something went wrong');
        }
        
        router.push('/auth/signin');
      } else {
        // Use the existing JSON-based signup for non-business users or business without image
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },          body: JSON.stringify({
            name,
            email,
            phoneNumber,
            password,
            universityId,
            role,
            business: role === Role.BUSINESS ? {
              name: businessName,
              description: businessDescription,
              bankName,
              accountNumber,
              categoryIds: selectedCategoryIds,
              subCategoryIds: selectedSubCategoryIds.length > 0 ? selectedSubCategoryIds : undefined,
              universityId,
            } : undefined,
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Something went wrong');
        }
        
        router.push('/auth/signin');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBusinessImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError('File size too large. Maximum size is 5MB.');
      return;
    }

    setBusinessImage(file);
    setBusinessImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveBusinessImage = () => {
    setBusinessImage(null);
    if (businessImagePreview) {
      URL.revokeObjectURL(businessImagePreview);
      setBusinessImagePreview(null);
    }
  };

  const handleAddNewUniversity = async () => {
    if (!newUniversityName.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await createUniversityAction(newUniversityName);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      if (result.success && result.university) {
        // Add the new university to the list and select it
        setUniversities(prev => [...prev, result.university]);
        setFormData(prev => ({ ...prev, universityId: result.university.id }));
        setNewUniversityName('');
        setShowNewUniversityInput(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create university');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center text-secondary">Sign Up</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="role" className="block mb-1 font-medium text-secondary">
            Account Type
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
            disabled={isLoading}
            required
          >
            <option value={Role.USER}>Student/Staff</option>
            <option value={Role.BUSINESS}>Business Owner</option>
          </select>
        </div>

        <div>
          <label htmlFor="name" className="block mb-1 font-medium text-secondary">
            Full Name
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
          <label htmlFor="email" className="block mb-1 font-medium text-secondary">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={isLoading}
            required
          />
        </div>
        
        <div>
          <label htmlFor="phoneNumber" className="block mb-1 font-medium text-secondary">
            Phone Number
          </label>          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={isLoading}
            placeholder="Enter your phone number"
            required
          />
        </div>
          <div>
          <label htmlFor="universityId" className="block mb-1 font-medium text-secondary">
            University
          </label>
          <div className="space-y-2">
            <select
              id="universityId"
              name="universityId"
              value={formData.universityId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
              disabled={isLoading || isFetchingData}
              required
            >
              <option value="" disabled>
                {isFetchingData ? 'Loading...' : 'Select your university'}
              </option>
              {universities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name}
                </option>
              ))}
            </select>
            
            <div>
              {showNewUniversityInput ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newUniversityName}
                    onChange={(e) => setNewUniversityName(e.target.value)}
                    placeholder="Enter university name"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={handleAddNewUniversity}
                    disabled={isLoading || !newUniversityName.trim()}
                    className="inline-flex items-center rounded-md border border-transparent bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Adding...' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewUniversityInput(false);
                      setNewUniversityName('');
                    }}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNewUniversityInput(true)}
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 focus:outline-none"
                  disabled={isLoading}
                >
                  <Plus size={16} className="mr-1" />
                  Don't see your university? Add it here
                </button>
              )}
            </div>
          </div>
        </div>
        
        {formData.role === Role.BUSINESS && (
          <>
            <div>
              <label htmlFor="businessName" className="block mb-1 font-medium text-secondary">
                Business Name
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isLoading}
                required
              />
            </div>            
            <div>
              <label htmlFor="businessDescription" className="block mb-1 font-medium text-secondary">
                Business Description
              </label>
              <textarea
                id="businessDescription"
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="bankName" className="block mb-1 font-medium text-secondary">
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
              <label htmlFor="accountNumber" className="block mb-1 font-medium text-secondary">
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
              <label className="block mb-1 font-medium text-secondary">
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

            {selectedCategoryIds.length > 0 && (
              <div>
                <label className="block mb-1 font-medium text-secondary">
                  Subcategories
                </label>
                <div className="space-y-6 p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Select subcategories for each of your business categories. You can also add new subcategories if needed.
                  </p>
                  
                  {categories
                    .filter(category => selectedCategoryIds.includes(category.id))
                    .map(category => (
                      <div key={category.id} className="pt-4 border-t border-gray-200 first:pt-0 first:border-t-0">
                        <div className="font-medium text-secondary mb-2">
                          {category.name}
                        </div>
                        
                        <CategorySubcategories 
                          categoryId={category.id}
                          isLoading={isLoading}
                          setError={setError}
                          setIsLoading={setIsLoading}
                          selectedSubCategoryIds={selectedSubCategoryIds}
                          setSelectedSubCategoryIds={setSelectedSubCategoryIds}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
        
        <div>
          <label htmlFor="password" className="block mb-1 font-medium text-secondary">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={isLoading}
            required
          />
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block mb-1 font-medium text-secondary">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={isLoading}
            required
          />
        </div>

        {formData.role === Role.BUSINESS && (
          <div>
            <label className="block mb-1 font-medium text-secondary">
              Business Image
            </label>
            <div className="flex items-center space-x-4">              {businessImagePreview ? (
                <div className="relative">
                  <Image
                    src={businessImagePreview}
                    alt="Business Image Preview"
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveBusinessImage}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                    disabled={isLoading}
                    title="Remove image"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <span className="text-sm text-gray-500">
                  No image selected
                </span>
              )}
              
              <label className="flex items-center cursor-pointer">
                <span className="text-sm text-gray-700 mr-2">
                  {businessImagePreview ? 'Change Image' : 'Upload Image'}
                </span>                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBusinessImageChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors">
                  <Upload size={20} />
                </span>
              </label>
            </div>
          </div>
        )}
        
        <div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            disabled={isLoading || isFetchingData}
          >
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </button>
        </div>
        
        {showNewUniversityInput && (
          <div className="mt-4">
            <input
              type="text"
              value={newUniversityName}
              onChange={(e) => setNewUniversityName(e.target.value)}
              placeholder="Enter new university name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={isLoading}
            />
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => setShowNewUniversityInput(prev => !prev)}
            className="text-sm font-medium text-primary hover:text-primary/80"
            disabled={isLoading}
          >
            {showNewUniversityInput ? 'Cancel' : 'Add New University'}
          </button>
          
          {showNewUniversityInput && (
            <button
              type="button"
              onClick={handleAddNewUniversity}
              className="inline-flex items-center rounded-md border border-transparent bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !newUniversityName.trim()}
            >
              {isLoading ? 'Adding...' : 'Add'}
            </button>
          )}
        </div>
      </form>
      
      <p className="mt-4 text-center text-secondary/80">
        Already have an account?{' '}
        <Link href="/auth/signin" className="text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </main>
  );
}

function CategorySubcategories({ 
  categoryId, 
  isLoading, 
  setError, 
  setIsLoading,
  selectedSubCategoryIds,
  setSelectedSubCategoryIds
}: { 
  categoryId: string; 
  isLoading: boolean; 
  setError: (error: string) => void;
  setIsLoading: (loading: boolean) => void;
  selectedSubCategoryIds: string[];
  setSelectedSubCategoryIds: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [categorySubcategories, setCategorySubcategories] = useState<SubCategory[]>([]);
  const [newSubCategoryName, setNewSubCategoryName] = useState<string>('');
  const [showNewSubCategoryInput, setShowNewSubCategoryInput] = useState(false);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);

  useEffect(() => {
    const loadSubCategories = async () => {
      setIsLoadingSubcategories(true);
      try {
        const result = await fetchSubCategoriesByCategory(categoryId);
        if (result.subCategories) {
          setCategorySubcategories(result.subCategories);
        }
      } catch (err) {
        console.error('Error fetching subcategories:', err);
      } finally {
        setIsLoadingSubcategories(false);
      }
    };

    loadSubCategories();
  }, [categoryId]);

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
    if (!newSubCategoryName.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Call the server action to create a new subcategory with signupMode=true
      const result = await createSubCategoryAction(newSubCategoryName, categoryId, true);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      if (result.success && result.subcategory) {
        // Add the new subcategory to the list and select it
        setCategorySubcategories(prev => [...prev, result.subcategory]);
        setSelectedSubCategoryIds(prev => [...prev, result.subcategory.id]);
        setNewSubCategoryName('');
        setShowNewSubCategoryInput(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create subcategory');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingSubcategories) {
    return <p className="text-sm text-gray-500">Loading subcategories...</p>;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {categorySubcategories.length > 0 ? (
          categorySubcategories.map(subCategory => (
            <div key={subCategory.id} className="flex items-center">
              <input
                type="checkbox"
                id={`subcat-${subCategory.id}`}
                checked={selectedSubCategoryIds.includes(subCategory.id)}
                onChange={() => handleSubCategoryChange(subCategory.id)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                disabled={isLoading}
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
      
      <div>
        {showNewSubCategoryInput ? (
          <div className="mt-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newSubCategoryName}
                onChange={(e) => setNewSubCategoryName(e.target.value)}
                placeholder="Enter new subcategory name"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleAddNewSubCategory}
                disabled={isLoading || !newSubCategoryName.trim()}
                className="inline-flex items-center rounded-md border border-transparent bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewSubCategoryInput(false);
                  setNewSubCategoryName('');
                }}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowNewSubCategoryInput(true)}
            className="text-sm font-medium text-primary hover:text-primary/80"
            disabled={isLoading}
          >
            + Add new subcategory
          </button>
        )}
      </div>
    </div>
  );
}