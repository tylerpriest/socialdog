'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthProvider'
import { AccountUpgradeForm } from '@/features/auth/components/AccountUpgradeForm'
import { Navigation } from '@/components/Navigation'

export default function UpgradePage() {
  const router = useRouter()
  const { user, isAnonymous, isLoading } = useAuth()

  // Redirect if not a guest user
  useEffect(() => {
    if (!isLoading && (!user || !isAnonymous)) {
      router.push('/dashboard')
    }
  }, [user, isAnonymous, isLoading, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not a guest user (redirect will happen)
  if (!user || !isAnonymous) {
    return null
  }

  const handleUpgradeSuccess = () => {
    router.push('/dashboard?welcome=true')
  }

  const handleUpgradeCancel = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <Navigation />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Join the Pack?
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              You've been exploring as a guest. Create your permanent account to unlock all features and connect with the full SocialDog community.
            </p>

            {/* Progress indicator */}
            <div className="inline-flex items-center space-x-2 text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
              <span>Guest session active</span>
            </div>
          </div>

          {/* Upgrade Form */}
          <AccountUpgradeForm
            onSuccess={handleUpgradeSuccess}
            onCancel={handleUpgradeCancel}
          />

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Why Upgrade?
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Create Dog Profiles</p>
                      <p className="text-sm text-gray-600">Show off your furry friends to the community</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Message Dog Owners</p>
                      <p className="text-sm text-gray-600">Arrange playdates and make connections</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Save Favorites</p>
                      <p className="text-sm text-gray-600">Keep track of dogs and owners you like</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Full Community Access</p>
                      <p className="text-sm text-gray-600">Join events, groups, and local meetups</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🔒 Your data is secure. We use industry-standard encryption and never share your personal information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}