'use client';

import { useState, useEffect } from 'react';
import { University } from '@/types/business';

interface ShippingInfoFormProps {
  initialData?: {
    name: string;
    hall: string;
    universityId: string;
  };
  universities: University[];
  onSubmit: (data: { name: string; hall: string; universityId: string }) => void;
  isLoading?: boolean;
}

export default function ShippingInfoForm({
  initialData,
  universities,
  onSubmit,
  isLoading = false,
}: ShippingInfoFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [hall, setHall] = useState(initialData?.hall || '');
  const [universityId, setUniversityId] = useState(initialData?.universityId || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Recipient name is required';
    }
    
    if (!hall.trim()) {
      newErrors.hall = 'Hall/Building is required';
    }
    
    if (!universityId) {
      newErrors.universityId = 'University is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        name,
        hall,
        universityId,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-secondary mb-4">Shipping Information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter recipient's name"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
            University
          </label>
          <select
            id="university"
            value={universityId}
            onChange={(e) => setUniversityId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoading}
          >
            <option value="">Select a university</option>
            {universities.map((university) => (
              <option key={university.id} value={university.id}>
                {university.name}
              </option>
            ))}
          </select>
          {errors.universityId && (
            <p className="mt-1 text-sm text-red-600">{errors.universityId}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="hall" className="block text-sm font-medium text-gray-700 mb-1">
            Hall/Building
          </label>
          <input
            type="text"
            id="hall"
            value={hall}
            onChange={(e) => setHall(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter hall or building name"
            disabled={isLoading}
          />
          {errors.hall && (
            <p className="mt-1 text-sm text-red-600">{errors.hall}</p>
          )}
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3 px-4 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Continue to Payment Method'}
          </button>
        </div>
      </form>
    </div>
  );
} 