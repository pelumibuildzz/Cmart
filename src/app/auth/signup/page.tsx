'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { University } from '@/generated/prisma';
import { fetchUniversities } from '@/app/actions/university.action';

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    universityId: '',
  });
  const [universities, setUniversities] = useState<University[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUniversities, setIsFetchingUniversities] = useState(true);

  useEffect(() => {
    const loadUniversities = async () => {
      setIsFetchingUniversities(true);
      try {
        const result = await fetchUniversities();
        if (result.error) {
          throw new Error(result.error);
        }
        if (result.universities) {
          setUniversities(result.universities);
        }
      } catch (err: any) {
        setError('Could not load universities. Please try again later.');
        console.error(err);
      } finally {
        setIsFetchingUniversities(false);
      }
    };
    loadUniversities();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { name, email, password, confirmPassword, universityId } = formData;
    
    if (!name || !email || !password || !confirmPassword || !universityId) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          universityId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      router.push('/auth/signin');
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
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
          <label htmlFor="universityId" className="block mb-1 font-medium text-secondary">
            University
          </label>
          <select
            id="universityId"
            name="universityId"
            value={formData.universityId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
            disabled={isLoading || isFetchingUniversities}
            required
          >
            <option value="" disabled>
              {isFetchingUniversities ? 'Loading...' : 'Select your university'}
            </option>
            {universities.map((uni) => (
              <option key={uni.id} value={uni.id}>
                {uni.name}
              </option>
            ))}
          </select>
        </div>
        
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
        
        <div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            disabled={isLoading || isFetchingUniversities}
          >
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </button>
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