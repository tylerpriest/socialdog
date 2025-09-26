'use client'

import { useState } from 'react'
import { DogBrowseList } from '@/features/discovery/components/DogBrowseList'
import { Navigation } from '@/components/Navigation'
import { Dog } from '@/types'

export default function DiscoverPage() {
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null)

  const handleDogSelect = (dog: Dog) => {
    setSelectedDog(dog)
  }

  const handleCloseModal = () => {
    setSelectedDog(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation variant="authenticated" />

      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Discover Dogs</h1>
            <p className="mt-1 text-sm text-gray-600">
              Find furry friends in your neighborhood
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <DogBrowseList onDogSelect={handleDogSelect} />
        </div>
      </div>

      {/* Dog Detail Modal */}
      {selectedDog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-sm sm:max-w-md shadow-lg rounded-md bg-white mx-4 sm:mx-auto">
            <div className="mt-3">
              {selectedDog.photo_url && (
                <div className="mb-4">
                  <img
                    src={selectedDog.photo_url}
                    alt={selectedDog.name}
                    className="w-full h-48 sm:h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedDog.name}
                </h3>
                <p className="text-gray-600 mb-1">{selectedDog.breed}</p>
                <p className="text-gray-600 mb-1">{selectedDog.age} years old</p>
                <p className="text-gray-600 mb-1 capitalize">{selectedDog.gender}</p>
                <p className="text-gray-600 mb-1 capitalize">{selectedDog.size}</p>
                <p className="text-gray-600 mb-4 capitalize">{selectedDog.temperament}</p>

                {selectedDog.bio && (
                  <p className="text-gray-700 mb-4 text-left">
                    {selectedDog.bio}
                  </p>
                )}

                {selectedDog.owner && (
                  <p className="text-gray-500 mb-4">
                    Owned by {selectedDog.owner.firstName} {selectedDog.owner.lastName}
                  </p>
                )}

                {selectedDog.location && (
                  <p className="text-gray-400 mb-4">
                    📍 {typeof selectedDog.location === 'string' ? selectedDog.location : `${selectedDog.location.lat.toFixed(4)}, ${selectedDog.location.lng.toFixed(4)}`}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 justify-center">
                  <button className="px-4 py-2 bg-purple-600 text-white text-base font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300">
                    Send Message
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}