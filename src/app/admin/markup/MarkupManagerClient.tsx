'use client';

import { useState } from 'react';
import { Edit, Save, RefreshCw } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  basePrice: number;
  finalPrice: number;
  markupPercent: number;
  business: {
    id: string;
    name: string;
  } | null;
}

interface MarkupManagerClientProps {
  products: Product[];
  onUpdateProductMarkup: (productId: string, markupPercent: number) => Promise<void>;
  onUpdateAllProductsMarkup: (markupPercent: number) => Promise<void>;
}

export default function MarkupManagerClient({
  products,
  onUpdateProductMarkup,
  onUpdateAllProductsMarkup,
}: MarkupManagerClientProps) {
  const [editingProductId, setEditingProductId] = useState<string | null>(null);  const [markupPercentValues, setMarkupPercentValues] = useState<Record<string, number>>(() => {
    const initialValues: Record<string, number> = {};
    products.forEach(product => {
      initialValues[product.id] = product.markupPercent;
    });
    return initialValues;
  });
  const [globalMarkupPercent, setGlobalMarkupPercent] = useState<number>(10);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [isUpdatingIndividual, setIsUpdatingIndividual] = useState<Record<string, boolean>>({});

  const handleEdit = (productId: string) => {
    setEditingProductId(productId);
  };

  const handleSave = async (productId: string) => {
    try {
      setIsUpdatingIndividual(prev => ({ ...prev, [productId]: true }));
      await onUpdateProductMarkup(productId, markupPercentValues[productId]);
      setEditingProductId(null);
    } catch (error) {
      console.error('Failed to update markup:', error);
    } finally {
      setIsUpdatingIndividual(prev => ({ ...prev, [productId]: false }));
    }
  };
  const handleInputChange = (productId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setMarkupPercentValues(prev => ({
        ...prev,
        [productId]: numValue
      }));
    }
  };

  const handleUpdateAllMarkups = async () => {
    try {
      setIsUpdatingAll(true);
      await onUpdateAllProductsMarkup(globalMarkupPercent);
      
      // Update all local values to match
      const updatedMarkups = products.reduce((acc, product) => {
        acc[product.id] = globalMarkupPercent;
        return acc;
      }, {} as Record<string, number>);
      
      setMarkupPercentValues(updatedMarkups);
    } catch (error) {
      console.error('Failed to update all markups:', error);
    } finally {
      setIsUpdatingAll(false);
    }
  };

  // Calculate new final price based on base price and markup
  const calculateFinalPrice = (basePrice: number, markupPercent: number) => {
    return basePrice * (1 + markupPercent / 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-secondary mb-8">Product Markup Manager</h1>
        
        {/* Global Markup Update Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-secondary mb-4">Update All Product Markups</h2>
          <div className="flex items-end gap-4">
            <div className="w-1/3">
              <label htmlFor="globalMarkup" className="block text-sm font-medium text-gray-700 mb-1">
                Global Markup Percentage
              </label>
              <input
                type="number"
                id="globalMarkup"
                min="0"
                max="100"
                value={globalMarkupPercent}
                onChange={(e) => setGlobalMarkupPercent(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={handleUpdateAllMarkups}
              disabled={isUpdatingAll}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
            >
              {isUpdatingAll ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>Apply to All Products</>
              )}
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            This will update the markup percentage for all products and recalculate their final prices.
          </p>
        </div>
        
        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-secondary">Individual Product Markups</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Price (₦)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Markup %
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Final Price (₦)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{product.business?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₦{product.basePrice.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingProductId === product.id ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={markupPercentValues[product.id]}
                          onChange={(e) => handleInputChange(product.id, e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{product.markupPercent}%</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {editingProductId === product.id ? (
                          <>₦{calculateFinalPrice(product.basePrice, markupPercentValues[product.id]).toLocaleString()}</>
                        ) : (
                          <>₦{product.finalPrice.toLocaleString()}</>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingProductId === product.id ? (
                        <button
                          onClick={() => handleSave(product.id)}
                          disabled={isUpdatingIndividual[product.id]}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          {isUpdatingIndividual[product.id] ? (
                            <RefreshCw className="h-5 w-5 animate-spin" />
                          ) : (
                            <Save className="h-5 w-5" />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(product.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
