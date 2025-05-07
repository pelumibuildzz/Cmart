'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { useCartStore } from '@/lib/store/cart';
import { ShoppingCart, ChevronDown, Menu, User } from 'lucide-react';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

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
              href="/category" 
              className={`hover:text-primary ${pathname === '/category' ? 'text-primary' : 'text-secondary'}`}
            >
              Categories
            </Link>

            <Link 
              href="/markets" 
              className={`hover:text-primary ${pathname === '/markets' ? 'text-primary' : 'text-secondary'}`}
            >
              Markets
            </Link>

            <Link 
              href="/cart" 
              className={`hover:text-primary ${pathname === '/cart' ? 'text-primary' : 'text-secondary'} relative`}
            >
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                className={`flex items-center space-x-1 hover:text-primary ${
                  session ? (pathname === '/profile' ? 'text-primary' : 'text-secondary') : 'text-secondary'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                }}
              >
                <User className="h-5 w-5" />
                <ChevronDown className="h-4 w-4" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50">
                  {session ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-secondary">{session.user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                      </div>
                      <Link 
                        href="/profile" 
                        className={`block px-4 py-2 hover:bg-gray-50 ${pathname === '/profile' ? 'text-primary' : 'text-secondary'}`}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link 
                        href="/orders" 
                        className={`block px-4 py-2 hover:bg-gray-50 ${pathname === '/orders' ? 'text-primary' : 'text-secondary'}`}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Orders
                      </Link>
                      {session.user.role === 'BUSINESS' && (
                        <Link 
                          href="/business/dashboard" 
                          className={`block px-4 py-2 hover:bg-gray-50 ${pathname === '/business/dashboard' ? 'text-primary' : 'text-secondary'}`}
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                      {session.user.role === 'ADMIN' && (
                        <Link 
                          href="/admin/dashboard" 
                          className={`block px-4 py-2 hover:bg-gray-50 ${pathname === '/business/dashboard' ? 'text-primary' : 'text-secondary'}`}
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                      <button 
                        onClick={() => {
                          signOut({ callbackUrl: '/' });
                          setIsProfileMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-secondary hover:bg-gray-50"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/auth/signin" 
                        className="block px-4 py-2 text-secondary hover:bg-gray-50"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link 
                        href="/auth/signup" 
                        className="block px-4 py-2 text-white bg-primary hover:bg-primary/90 mx-2 rounded-md text-center"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-secondary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
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
              href="/category" 
              className={`block hover:text-primary px-1 py-2 ${pathname === '/category' ? 'text-primary' : 'text-secondary'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Categories
            </Link>
            
            <Link 
              href="/markets" 
              className={`block hover:text-primary px-1 py-2 ${pathname === '/markets' ? 'text-primary' : 'text-secondary'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Markets
            </Link>
            
            <Link 
              href="/cart" 
              className={`block hover:text-primary px-1 py-2 ${pathname === '/cart' ? 'text-primary' : 'text-secondary'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center justify-between">
                <span>Cart</span>
                {itemCount > 0 && (
                  <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                    {itemCount}
                  </span>
                )}
              </div>
            </Link>
            
            {/* Account Section - Mobile */}
            <div className="py-2 border-t border-gray-100">
              <div className="text-sm font-medium text-gray-500 mb-2 px-1">Account</div>
              {session ? (
                <>
                  <div className="px-1 py-2 mb-2">
                    <p className="text-sm font-medium text-secondary">{session.user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                  </div>
                  <Link 
                    href="/profile" 
                    className={`block hover:text-primary px-1 py-2 ${pathname === '/profile' ? 'text-primary' : 'text-secondary'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    href="/orders" 
                    className={`block hover:text-primary px-1 py-2 ${pathname === '/orders' ? 'text-primary' : 'text-secondary'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  {session.user.role === 'BUSINESS' && (
                    <Link 
                      href="/business/dashboard" 
                      className={`block hover:text-primary px-1 py-2 ${pathname === '/business/dashboard' ? 'text-primary' : 'text-secondary'}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  {session.user.role === 'ADMIN' && (
                    <Link 
                      href="/admin/dashboard" 
                      className={`block hover:text-primary px-1 py-2 ${pathname === '/business/dashboard' ? 'text-primary' : 'text-secondary'}`}
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
                    className="block w-full text-left px-1 py-2 text-secondary hover:text-primary"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/signin" 
                    className={`block hover:text-primary px-1 py-2 text-secondary`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-center mt-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}