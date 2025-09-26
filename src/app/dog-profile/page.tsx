'use client'

import { useState } from 'react'
import { DogProfileForm } from '@/features/profiles/components/DogProfileForm'
import { Navigation } from '@/components/Navigation'
import { useRouter } from 'next/navigation'

export default function DogProfilePage() {
  const router = useRouter()
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSuccess = () => {
    setIsSuccess(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow px-6 py-8 text-center">
            <div className="text-green-600 text-4xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Dog Profile Created!
            </h2>
            <p className="text-gray-600 mb-4">
              Your furry friend's profile has been successfully created.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation variant="authenticated" />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Create Dog Profile
            </h1>
            <p className="mt-2 text-gray-600">
              Tell others about your furry friend
            </p>
          </div>

        <div className="bg-white rounded-lg shadow px-6 py-8">
          <DogProfileForm onSuccess={handleSuccess} />
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-purple-600 hover:text-purple-700 text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}