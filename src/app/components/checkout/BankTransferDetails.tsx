'use client';

import { useState } from 'react';
import { Copy, CheckCircle, CameraIcon, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankLogo?: string;
}

// Sample bank accounts - in a real app, these would come from the database
const BANK_ACCOUNTS: Record<string, BankAccount> = {
  'bank-1': {
    id: 'bank-1',
    bankName: 'First Bank',
    accountName: 'C-Mart Ltd',
    accountNumber: '1234567890',
    bankLogo: '/images/banks/firstbank.png',
  },
  'bank-2': {
    id: 'bank-2',
    bankName: 'GTBank',
    accountName: 'C-Mart Ltd',
    accountNumber: '0987654321',
    bankLogo: '/images/banks/gtbank.png',
  },
  'bank-3': {
    id: 'bank-3',
    bankName: 'Zenith Bank',
    accountName: 'C-Mart Ltd',
    accountNumber: '5678901234',
    bankLogo: '/images/banks/zenithbank.png',
  },
};

interface BankTransferDetailsProps {
  bankAccountId: string;
  amount: number;
  onComplete: () => void;
  isLoading?: boolean;
}

export default function BankTransferDetails({
  bankAccountId,
  amount,
  onComplete,
  isLoading = false,
}: BankTransferDetailsProps) {
  const [copySuccess, setCopySuccess] = useState<Record<string, boolean>>({});
  
  const selectedBank = BANK_ACCOUNTS[bankAccountId];
  
  if (!selectedBank) {
    return <div className="text-red-600">Bank account not found</div>;
  }
  
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess({ ...copySuccess, [key]: true });
      setTimeout(() => {
        setCopySuccess({ ...copySuccess, [key]: false });
      }, 2000);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-secondary mb-4">Bank Transfer Details</h2>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Please make a transfer to the following bank account. After completing the transfer, take a screenshot of the payment receipt.
        </p>
      </div>
      
      <div className="p-5 border border-gray-200 rounded-lg bg-gray-50 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Bank Name</span>
          <div className="flex items-center">
            <span className="font-semibold">{selectedBank.bankName}</span>
            <button
              type="button"
              className="ml-2 text-primary p-1 hover:bg-primary/10 rounded-full transition-colors"
              onClick={() => handleCopy(selectedBank.bankName, 'bankName')}
            >
              {copySuccess.bankName ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Account Name</span>
          <div className="flex items-center">
            <span className="font-semibold">{selectedBank.accountName}</span>
            <button
              type="button"
              className="ml-2 text-primary p-1 hover:bg-primary/10 rounded-full transition-colors"
              onClick={() => handleCopy(selectedBank.accountName, 'accountName')}
            >
              {copySuccess.accountName ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Account Number</span>
          <div className="flex items-center">
            <span className="font-semibold">{selectedBank.accountNumber}</span>
            <button
              type="button"
              className="ml-2 text-primary p-1 hover:bg-primary/10 rounded-full transition-colors"
              onClick={() => handleCopy(selectedBank.accountNumber, 'accountNumber')}
            >
              {copySuccess.accountNumber ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Amount to Transfer</span>
          <div className="flex items-center">
            <span className="font-semibold text-lg text-primary">{formatPrice(amount)}</span>
            <button
              type="button"
              className="ml-2 text-primary p-1 hover:bg-primary/10 rounded-full transition-colors"
              onClick={() => handleCopy(amount.toFixed(2), 'amount')}
            >
              {copySuccess.amount ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      
      <div className="border border-orange-200 bg-orange-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-orange-800 mb-2">Important Instructions:</h3>
        <ol className="list-decimal pl-4 space-y-2 text-sm text-orange-700">
          <li>Transfer the <b>exact amount</b> shown above to the bank account details provided.</li>
          <li>After making the transfer, take a screenshot or photo of the payment receipt/confirmation.</li>
          <li>On the next screen, you'll be asked to upload this receipt to complete your order.</li>
          <li>Your order will be processed once the payment has been verified.</li>
        </ol>
      </div>
      
      <div className="pt-4">
        <button
          type="button"
          onClick={onComplete}
          className="w-full py-3 px-4 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : (
            <>
              I have completed the transfer
              <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
} 