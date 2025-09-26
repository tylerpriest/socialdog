'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthProvider'

interface NavigationProps {
  variant?: 'public' | 'authenticated' | 'guest'
}

export function Navigation({ variant = 'public' }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isAnonymous, signOut, sessionExpiresAt } = useAuth()

  // Auto-detect variant based on auth state if not explicitly set
  const actualVariant = variant === 'public' && user
    ? (isAnonymous ? 'guest' : 'authenticated')
    : variant

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={actualVariant === 'authenticated' || actualVariant === 'guest' ? '/dashboard' : '/'} className="flex items-center">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🐕</span>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">SocialDog</h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {actualVariant === 'authenticated' ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/discover"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Browse Dogs
                </Link>
                <Link
                  href="/dog-profile"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Add Dog
                </Link>
                <Link
                  href="/messages"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Messages
                </Link>
                <button
                  onClick={() => signOut()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : actualVariant === 'guest' ? (
              <>
                <span className="text-orange-600 text-xs font-medium px-2 py-1 bg-orange-50 rounded-full">
                  Guest User
                </span>
                <Link
                  href="/discover"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Browse Dogs
                </Link>
                <Link
                  href="/upgrade"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Upgrade Account
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Exit Guest
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-purple-600 p-2"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-2 border-t">
            {actualVariant === 'authenticated' ? (
              <div className="flex flex-col space-y-2">
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-purple-600 px-3 py-3 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/discover"
                  className="text-gray-700 hover:text-purple-600 px-3 py-3 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Browse Dogs
                </Link>
                <Link
                  href="/dog-profile"
                  className="text-gray-700 hover:text-purple-600 px-3 py-3 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Add Dog
                </Link>
                <Link
                  href="/messages"
                  className="text-gray-700 hover:text-purple-600 px-3 py-3 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Messages
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    signOut()
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-3 rounded-md text-base font-medium text-left"
                >
                  Logout
                </button>
              </div>
            ) : actualVariant === 'guest' ? (
              <div className="flex flex-col space-y-2">
                <div className="px-3 py-2">
                  <span className="text-orange-600 text-sm font-medium px-2 py-1 bg-orange-50 rounded-full">
                    Guest User
                  </span>
                </div>
                <Link
                  href="/discover"
                  className="text-gray-700 hover:text-purple-600 px-3 py-3 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Browse Dogs
                </Link>
                <Link
                  href="/upgrade"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 py-3 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Upgrade Account
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    signOut()
                  }}
                  className="text-gray-700 hover:text-purple-600 px-3 py-3 rounded-md text-base font-medium text-left"
                >
                  Exit Guest
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-purple-600 px-3 py-3 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-3 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}