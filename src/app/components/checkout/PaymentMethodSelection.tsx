'use client';

import { useState } from 'react';
import { CreditCard, ArrowRight } from 'lucide-react';

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankLogo?: string;
}

interface PaymentMethodSelectionProps {
  onSelect: (bankAccountId: string) => void;
  isLoading?: boolean;
}

// Sample bank accounts - in a real app, these would come from the database
const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank-1',
    bankName: 'Moniepoint MFB',
    accountName: 'SOMTOCHUKWU EDWIN-IKU',
    accountNumber: '9071976196',
    bankLogo: '/banks/moniepoint.jpeg',
  },
  {
    id: 'bank-2',
    bankName: 'Nombank Mfb',
    accountName: 'SOMTOCHUKWU EDWIN-IKU',
    accountNumber: '1466933912',
    bankLogo: '/banks/nombank.png',
  },
  {
    id: 'bank-3',
    bankName: 'Kuda Mfb',
    accountName: 'SOMTOCHUKWU EDWIN-IKU',
    accountNumber: '3002523540',
    bankLogo: '/banks/kuda.svg',
  },
];

export default function PaymentMethodSelection({
  onSelect,
  isLoading = false,
}: PaymentMethodSelectionProps) {
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBankId) {
      setError('Please select a bank account for transfer');
      return;
    }
    
    onSelect(selectedBankId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-secondary mb-4">Select Payment Method</h2>
      
      <div className="mb-6">
        <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          <CreditCard className="w-4 h-4 mr-1" /> 
          Bank Transfer
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Select a bank account to make your transfer. After making the transfer, you'll be required to upload a screenshot of the transfer receipt.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-3">
          {BANK_ACCOUNTS.map((bank) => (
            <div 
              key={bank.id}
              className={`border rounded-md p-4 cursor-pointer transition-colors ${
                selectedBankId === bank.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-primary/50'
              }`}
              onClick={() => {
                setSelectedBankId(bank.id);
                setError('');
              }}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border border-gray-200 mr-3 flex items-center justify-center">
                  {selectedBankId === bank.id && (
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  )}
                </div>
                
                {bank.bankLogo && (
                  <img 
                    src={bank.bankLogo} 
                    alt={`${bank.bankName} logo`}
                    className="w-8 h-8 object-contain mr-3"
                  />
                )}
                
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900">{bank.bankName}</h3>
                  <p className="text-sm text-gray-600">
                    {bank.accountName} &bull; {bank.accountNumber}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3 px-4 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (
              <>
                Continue to Bank Details
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 