'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Dog } from '@/types'

interface DogBrowseListProps {
  onDogSelect: (dog: Dog) => void
}

export function DogBrowseList({ onDogSelect }: DogBrowseListProps) {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDogs = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('dog_profiles')
        .select(`
          id,
          name,
          breed,
          age,
          gender,
          size,
          temperament,
          bio,
          photo_url,
          location,
          owner:profiles(firstName, lastName)
        `)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      // TODO: Replace this mock data with real Supabase query results that match Dog interface
      setDogs((data as unknown as Dog[]) || [])
    } catch (err) {
      console.error('Error fetching dogs:', err)
      setError('Error loading dogs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDogs()
  }, [])

  const handleDogClick = (dog: Dog) => {
    onDogSelect(dog)
  }

  const handleRetry = () => {
    fetchDogs()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dogs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading dogs</p>
          <p className="text-gray-600 mb-4">Please try again</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (dogs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-600 mb-2">No dogs found</p>
          <p className="text-sm text-gray-500">Try adjusting your filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {dogs.map((dog) => (
        <div
          key={dog.id}
          data-testid="dog-card"
          onClick={() => handleDogClick(dog)}
          className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        >
          {dog.photo_url && (
            <div className="aspect-square">
              <img
                src={dog.photo_url}
                alt={dog.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{dog.name}</h3>
              <span className="text-sm text-gray-500 capitalize">
                {dog.size}
              </span>
            </div>

            <div className="space-y-1 mb-3">
              <p className="text-sm text-gray-600">{dog.breed}</p>
              <p className="text-sm text-gray-600">{dog.age} years old</p>
              <p className="text-sm text-gray-600 capitalize">{dog.temperament}</p>
            </div>

            {dog.bio && (
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                {dog.bio}
              </p>
            )}

            {dog.owner && (
              <p className="text-xs text-gray-500">
                Owned by {dog.owner.firstName} {dog.owner.lastName.charAt(0)}.
              </p>
            )}

            {dog.location && (
              <p className="text-xs text-gray-400 mt-1">
                📍 {typeof dog.location === 'string' ? dog.location : `${dog.location.lat.toFixed(4)}, ${dog.location.lng.toFixed(4)}`}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}