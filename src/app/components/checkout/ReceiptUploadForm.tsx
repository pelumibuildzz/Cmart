'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Check } from 'lucide-react';

interface ReceiptUploadFormProps {
  onSubmit: (data: { receiptImage: File; payerAccountName: string }) => void;
  isLoading?: boolean;
}

export default function ReceiptUploadForm({
  onSubmit,
  isLoading = false,
}: ReceiptUploadFormProps) {
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [payerAccountName, setPayerAccountName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!receiptImage) {
      newErrors.receiptImage = 'Payment receipt image is required';
    }
    
    if (!payerAccountName.trim()) {
      newErrors.payerAccountName = 'Payer account name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          receiptImage: 'Only JPG, PNG, and GIF images are allowed'
        });
        return;
      }
      
      // Validate file size (3MB max)
      const maxSize = 3 * 1024 * 1024; // 3MB
      if (file.size > maxSize) {
        setErrors({
          ...errors,
          receiptImage: 'File size must be less than 3MB'
        });
        return;
      }
      
      // Clear error if validation passes
      const { receiptImage, ...restErrors } = errors;
      setErrors(restErrors);
      
      // Set file and preview
      setReceiptImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setReceiptImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm() && receiptImage) {
      onSubmit({
        receiptImage,
        payerAccountName,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-secondary mb-4">Upload Payment Receipt</h2>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Please upload a screenshot or photo of your payment receipt to complete the order.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="payerAccountName" className="block text-sm font-medium text-gray-700 mb-1">
            Name on Payer's Account
          </label>
          <input
            type="text"
            id="payerAccountName"
            value={payerAccountName}
            onChange={(e) => setPayerAccountName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter the name on the account used for payment"
            disabled={isLoading}
          />
          {errors.payerAccountName && (
            <p className="mt-1 text-sm text-red-600">{errors.payerAccountName}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Receipt Image
          </label>
          
          {!previewUrl ? (
            <div 
              className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                errors.receiptImage ? 'border-red-300' : 'border-gray-300'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/gif"
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
              />
              <Upload className="w-10 h-10 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG, GIF (max 3MB)
              </p>
            </div>
          ) : (
            <div className="relative border rounded-md p-2">
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 transition-colors"
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
              </button>
              <div className="aspect-video relative rounded-md overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Receipt preview"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
          
          {errors.receiptImage && (
            <p className="mt-1 text-sm text-red-600">{errors.receiptImage}</p>
          )}
          
          <p className="mt-2 text-xs text-gray-500">
            Please ensure the receipt image clearly shows the transaction details including amount, date, and reference number.
          </p>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3 px-4 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (
              <>
                Complete Order
                <Check className="ml-2 w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 