'use client';

import { useState } from 'react';
import { Edit, Save, RefreshCw } from 'lucide-react';
import { updateProductMarkup, updateAllProductsMarkup } from '@/app/actions/markup.actions';

interface Product {
  id: string;
  name: string;
  basePrice: number;
  finalPrice: number;
  markupPercent: number;
  business: {
    id: string;
    name: string;
  };
}

export default function MarkupTable({ products }: { products: Product[] }) {
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [markupPercentValues, setMarkupPercentValues] = useState<Record<string, number>>(
    products.reduce((acc, product) => {
      acc[product.id] = product.markupPercent;
      return acc;
    }, {} as Record<string, number>)
  );
  const [globalMarkupPercent, setGlobalMarkupPercent] = useState<number>(10);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [isUpdatingIndividual, setIsUpdatingIndividual] = useState<Record<string, boolean>>({});
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  const handleEdit = (productId: string) => {
    setEditingProductId(productId);
  };

  const handleSave = async (productId: string) => {
    try {
      setIsUpdatingIndividual(prev => ({ ...prev, [productId]: true }));
      const result = await updateProductMarkup(productId, markupPercentValues[productId]);
      
      if (result.error) {
        setUpdateStatus(`Error: ${result.error}`);
      } else {
        setUpdateStatus('Product markup updated successfully');
        setEditingProductId(null);
      }
    } catch (error) {
      console.error('Failed to update markup:', error);
      setUpdateStatus('Failed to update markup');
    } finally {
      setIsUpdatingIndividual(prev => ({ ...prev, [productId]: false }));
      setTimeout(() => setUpdateStatus(null), 3000);
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
      const result = await updateAllProductsMarkup(globalMarkupPercent);
      
      if (result.error) {
        setUpdateStatus(`Error: ${result.error}`);
      } else {
        setUpdateStatus('All product markups updated successfully');
        // Update all local values to match the global value
        const updatedValues = products.reduce((acc, product) => {
          acc[product.id] = globalMarkupPercent;
          return acc;
        }, {} as Record<string, number>);
        
        setMarkupPercentValues(updatedValues);
        setEditingProductId(null);
        
        // Force page refresh to show updated values
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update all markups:', error);
      setUpdateStatus('Failed to update all markups');
    } finally {
      setIsUpdatingAll(false);
      setTimeout(() => setUpdateStatus(null), 3000);
    }
  };

  // Calculate what the final price would be with the new markup
  const calculateNewPrice = (basePrice: number, markupPercent: number) => {
    return basePrice * (1 + markupPercent / 100);
  };

  return (
    <>
      {/* Status Message */}
      {updateStatus && (
        <div className={`p-4 mb-4 rounded-md ${updateStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {updateStatus}
        </div>
      )}
      
      {/* Global Markup Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-secondary mb-4">Update All Product Markups</h2>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label htmlFor="globalMarkupPercent" className="block text-sm font-medium text-gray-700 mb-1">
              Global Markup Percentage
            </label>
            <input
              type="number"
              id="globalMarkupPercent"
              min="0"
              step="0.1"
              value={globalMarkupPercent}
              onChange={(e) => setGlobalMarkupPercent(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={handleUpdateAllMarkups}
            disabled={isUpdatingAll}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-gray-400 flex items-center"
          >
            {isUpdatingAll ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Apply to All Products'
            )}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          This will update the markup percentage for all products and recalculate their final prices.
        </p>
      </div>

      {/* Individual Products Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold text-secondary p-6 border-b">Product Markups</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Markup %
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Final Price
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                        step="0.1"
                        value={markupPercentValues[product.id]}
                        onChange={(e) => handleInputChange(product.id, e.target.value)}
                        className="w-24 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{product.markupPercent}%</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {editingProductId === product.id ? (
                        <>₦{calculateNewPrice(product.basePrice, markupPercentValues[product.id]).toLocaleString()}</>
                      ) : (
                        <>₦{product.finalPrice.toLocaleString()}</>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingProductId === product.id ? (
                      <button
                        onClick={() => handleSave(product.id)}
                        disabled={isUpdatingIndividual[product.id]}
                        className="text-primary hover:text-primary/80 focus:outline-none flex items-center"
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
                        className="text-primary hover:text-primary/80 focus:outline-none"
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
    </>
  );
}
