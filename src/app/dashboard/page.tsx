'use client'

import { UserProfileForm } from '@/features/profiles/components/UserProfileForm'
import { Navigation } from '@/components/Navigation'

// Mock profile data for now - will be replaced with real Supabase data
const mockProfile = {
  id: '123',
  userId: 'user-123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  location: 'Auckland',
  city: 'Auckland',
  authProvider: 'email' as const,
  emailVerified: true,
  bio: 'Dog lover and trainer with 5 years of experience. Love taking my Golden Retriever Max on adventures around Auckland.',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation variant="authenticated" />

      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your profile and connect with other dog owners
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                    Profile Information
                  </h3>
                  <UserProfileForm
                    profile={mockProfile}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <a
                      href="/dog-profile"
                      className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                    >
                      Add Your Dog
                    </a>
                    <a
                      href="/discover"
                      className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Browse Dogs
                    </a>
                    <a
                      href="/messages"
                      className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Messages
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg mt-6">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Activity Summary
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Dogs Added</dt>
                      <dd className="text-sm font-medium text-gray-900">1</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Connections</dt>
                      <dd className="text-sm font-medium text-gray-900">5</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Messages</dt>
                      <dd className="text-sm font-medium text-gray-900">12</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Playdates</dt>
                      <dd className="text-sm font-medium text-gray-900">3</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}