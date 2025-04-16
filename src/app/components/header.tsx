'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-secondary/10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-primary">
            C-Mart
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`hover:text-primary ${pathname === '/' ? 'text-primary' : 'text-secondary'}`}
            >
              Home
            </Link>
            <Link 
              href="/products" 
              className={`hover:text-primary ${pathname === '/products' ? 'text-primary' : 'text-secondary'}`}
            >
              Products
            </Link>
            
            {/* Authenticated user navbar items */}
            {session ? (
              <>
                <Link 
                  href="/profile" 
                  className={`hover:text-primary ${pathname === '/profile' ? 'text-primary' : 'text-secondary'}`}
                >
                  Profile
                </Link>
                {session.user.role === 'BUSINESS' && (
                  <Link 
                    href="/business/dashboard" 
                    className={`hover:text-primary ${pathname === '/business/dashboard' ? 'text-primary' : 'text-secondary'}`}
                  >
                    Dashboard
                  </Link>
                )}
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-secondary hover:text-primary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/signin" 
                  className={`hover:text-primary ${pathname === '/auth/signin' ? 'text-primary' : 'text-secondary'}`}
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-secondary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-4 pb-3">
            <Link 
              href="/" 
              className={`block hover:text-primary ${pathname === '/' ? 'text-primary' : 'text-secondary'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/products" 
              className={`block hover:text-primary ${pathname === '/products' ? 'text-primary' : 'text-secondary'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            
            {/* Authenticated user navbar items - mobile */}
            {session ? (
              <>
                <Link 
                  href="/profile" 
                  className={`block hover:text-primary ${pathname === '/profile' ? 'text-primary' : 'text-secondary'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                {session.user.role === 'BUSINESS' && (
                  <Link 
                    href="/business/dashboard" 
                    className={`block hover:text-primary ${pathname === '/business/dashboard' ? 'text-primary' : 'text-secondary'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <button 
                  onClick={() => {
                    signOut({ callbackUrl: '/' });
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-secondary hover:text-primary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/signin" 
                  className={`block hover:text-primary ${pathname === '/auth/signin' ? 'text-primary' : 'text-secondary'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}