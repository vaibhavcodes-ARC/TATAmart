'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '../store/useAuthStore';
import { ShoppingBag, User as UserIcon, LogOut, ArrowRight } from 'lucide-react';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/75 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 shadow-md transition-transform group-hover:scale-105 overflow-hidden p-1.5">
            <img src="/favicon.ico" alt="TATAmart Logo" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent dark:from-white dark:to-zinc-400">
              TATAmart
            </span>
            <span className="text-[10px] font-medium tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
              B2B Marketplace
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="font-inter hidden md:flex items-center space-x-8 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          <Link href="/" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">
            Home
          </Link>
          <Link href="/products" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">
            Explore Products
          </Link>
          <Link href="/categories" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">
            Categories
          </Link>
          {mounted && isAuthenticated && (
            <>
              {user?.role === 'SELLER' && (
                <Link href="/dashboard/seller" className="text-indigo-600 dark:text-indigo-400">
                  Seller Portal
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link href="/dashboard/admin" className="text-indigo-600 dark:text-indigo-400">
                  Admin Panel
                </Link>
              )}
              {user?.role === 'BUYER' && (
                <>
                  <Link href="/dashboard/buyer" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">
                    My Inquiries
                  </Link>
                  <Link href="/cart" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 py-1 px-2.5 rounded-lg text-xs text-indigo-600">
                    Cart 🛒
                  </Link>
                </>
              )}
            </>
          )}
        </nav>

        {/* User Auth Controls */}
        <div className="flex items-center space-x-4">
          {mounted ? (
            isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 rounded-full bg-zinc-100 py-1.5 px-3 dark:bg-zinc-800">
                  <UserIcon className="h-4 w-4 text-zinc-500" />
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {user.name} ({user.role})
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center justify-center h-9 w-9 rounded-xl bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-all shadow-sm"
                  title="Log Out"
                  id="btn-logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-sm font-semibold text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                  id="btn-login-nav"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center space-x-1 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/25 dark:shadow-indigo-600/10 transition-all hover:-translate-y-0.5"
                  id="btn-register-nav"
                >
                  <span>Join Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )
          ) : (
            <div className="h-9 w-20"></div>
          )}
        </div>
      </div>
    </header>
  );
}
