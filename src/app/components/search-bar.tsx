"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    
    // Trim and validate the query
    const trimmedQuery = query.trim();
    
    if (trimmedQuery) {
      // Encode the query and navigate to search page
      const searchUrl = `/search?query=${encodeURIComponent(trimmedQuery)}`;
      console.log('Navigating to:', searchUrl);
      router.push(searchUrl);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="flex items-center">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search className="h-5 w-5 text-secondary" />
          </div>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, businesses, categories..." 
            className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Search"
          />
        </div>
        <button 
          type="submit"
          className="ml-2 px-8 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center"
          aria-label="Submit search"
        >
          <span>Search</span>
        </button>
      </div>
    </form>
  );
} 