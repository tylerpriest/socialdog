'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'

interface UserProfileFormProps {
  profile: Profile
  onSuccess?: () => void
}

export function UserProfileForm({ profile, onSuccess }: UserProfileFormProps) {
  const [firstName, setFirstName] = useState(profile.firstName)
  const [lastName, setLastName] = useState(profile.lastName)
  const [location, setLocation] = useState(profile.location)
  const [bio, setBio] = useState(profile.bio || '')
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [updateError, setUpdateError] = useState('')

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!location.trim()) {
      newErrors.location = 'Location is required'
    }

    if (bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, profilePhoto: 'Please select an image file' })
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors({ ...errors, profilePhoto: 'Image must be less than 5MB' })
      return
    }

    setProfilePhoto(file)

    // Upload immediately
    const supabase = createClient()
    const fileName = `${profile.id}/${Date.now()}_${file.name}`

    try {
      const { data, error } = await supabase.storage
        .from('profiles')
        .upload(fileName, file)

      if (error) {
        setErrors({ ...errors, profilePhoto: 'Failed to upload image' })
      } else if (data?.path) {
        // Update profile with new photo URL
        await supabase
          .from('profiles')
          .update({ profilePhoto: data.path })
          .eq('id', profile.id)
      }
    } catch (error) {
      setErrors({ ...errors, profilePhoto: 'Failed to upload image' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setUpdateError('')

    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          location: location.trim(),
          bio: bio.trim()
        })
        .eq('id', profile.id)

      if (error) {
        setUpdateError(error.message)
      } else if (data && onSuccess) {
        onSuccess()
      }
    } catch (error) {
      setUpdateError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          id="location"
          type="text"
          placeholder="e.g. Auckland, Wellington"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location}</p>
        )}
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          placeholder="Tell other dog owners about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          {bio.length}/500 characters
        </p>
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
        )}
      </div>

      <div>
        <label htmlFor="profilePhoto" className="block text-sm font-medium text-gray-700">
          Profile Photo
        </label>
        <input
          id="profilePhoto"
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-purple-50 file:text-purple-700
            hover:file:bg-purple-100"
        />
        {errors.profilePhoto && (
          <p className="mt-1 text-sm text-red-600">{errors.profilePhoto}</p>
        )}
        {profile.profilePhoto && (
          <div className="mt-2">
            <img
              src={profile.profilePhoto}
              alt="Current profile"
              className="h-20 w-20 rounded-full object-cover"
            />
          </div>
        )}
      </div>

      {updateError && (
        <p className="text-sm text-red-600">{updateError}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  )
}