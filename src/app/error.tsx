'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-6">
          <AlertTriangle className="w-12 h-12 text-accent" />
        </div>
        <h1 className="text-3xl font-semibold text-secondary mb-4">Something went wrong!</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          We apologize for the inconvenience. An unexpected error has occurred. Our team has been notified and is working to fix it.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Try Again
        </button>
      </div>
    </div>
  );
} 