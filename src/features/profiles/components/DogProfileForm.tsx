'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Dog, DogFormData } from '@/types'

interface DogProfileFormProps {
  onSuccess: () => void
  dogProfile?: Dog
}

interface FormErrors {
  name?: string
  breed?: string
  age?: string
  photo?: string
  bio?: string
}

export function DogProfileForm({ onSuccess, dogProfile }: DogProfileFormProps) {
  const isEditing = !!dogProfile

  const [formData, setFormData] = useState({
    name: dogProfile?.name || '',
    breed: dogProfile?.breed || '',
    age: dogProfile?.age?.toString() || '',
    gender: dogProfile?.gender || 'male',
    size: dogProfile?.size || 'medium',
    temperament: dogProfile?.temperament || 'friendly',
    bio: dogProfile?.bio || '',
    photo: null as File | null
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Dog name is required'
    }

    if (!formData.breed.trim()) {
      newErrors.breed = 'Breed is required'
    }

    if (!formData.age.trim()) {
      newErrors.age = 'Age is required'
    } else {
      const ageNum = parseFloat(formData.age)
      if (isNaN(ageNum) || ageNum <= 0) {
        newErrors.age = 'Age must be a positive number'
      }
    }

    if (formData.bio.length > 300) {
      newErrors.bio = 'Bio must be 300 characters or less'
    }

    if (formData.photo) {
      if (formData.photo.size > 10 * 1024 * 1024) {
        newErrors.photo = 'Photo must be less than 10MB'
      }

      if (!formData.photo.type.startsWith('image/')) {
        newErrors.photo = 'Please select a valid image file'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }))

      // Validate file immediately
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photo: 'Photo must be less than 10MB' }))
      } else if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, photo: 'Please select a valid image file' }))
      } else {
        setErrors(prev => ({ ...prev, photo: undefined }))
      }
    }
  }

  const uploadPhoto = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('dog-photos')
      .upload(`dogs/${fileName}`, file)

    if (error) {
      throw error
    }

    const { data: { publicUrl } } = supabase.storage
      .from('dog-photos')
      .getPublicUrl(data.path)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      let photoUrl = dogProfile?.photo_url || undefined

      // Upload new photo if provided
      if (formData.photo) {
        const uploadedUrl = await uploadPhoto(formData.photo)
        photoUrl = uploadedUrl || undefined
      }

      const dogData = {
        name: formData.name.trim(),
        breed: formData.breed.trim(),
        age: parseInt(formData.age),
        gender: formData.gender as 'male' | 'female',
        size: formData.size as 'small' | 'medium' | 'large' | 'extra-large',
        temperament: formData.temperament as 'friendly' | 'playful' | 'calm' | 'energetic' | 'protective',
        bio: formData.bio.trim(),
        photo_url: photoUrl
      }

      if (isEditing && dogProfile) {
        const { error } = await supabase
          .from('dog_profiles')
          .update(dogData)
          .eq('id', dogProfile.id)
          .select()

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('dog_profiles')
          .insert([dogData])
          .select()

        if (error) throw error
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving dog profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Dog Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
          placeholder="Enter your dog's name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
          Breed *
        </label>
        <input
          type="text"
          id="breed"
          name="breed"
          value={formData.breed}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
          placeholder="e.g., Golden Retriever, Mixed Breed"
        />
        {errors.breed && (
          <p className="mt-1 text-sm text-red-600">{errors.breed}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
            Age (years) *
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            max="25"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
            placeholder="Age in years"
          />
          {errors.age && (
            <p className="mt-1 text-sm text-red-600">{errors.age}</p>
          )}
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
            Size
          </label>
          <select
            id="size"
            name="size"
            value={formData.size}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
          >
            <option value="small">Small (under 25 lbs)</option>
            <option value="medium">Medium (25-60 lbs)</option>
            <option value="large">Large (60-100 lbs)</option>
            <option value="extra-large">Extra Large (over 100 lbs)</option>
          </select>
        </div>

        <div>
          <label htmlFor="temperament" className="block text-sm font-medium text-gray-700 mb-1">
            Temperament
          </label>
          <select
            id="temperament"
            name="temperament"
            value={formData.temperament}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
          >
            <option value="friendly">Friendly</option>
            <option value="playful">Playful</option>
            <option value="calm">Calm</option>
            <option value="energetic">Energetic</option>
            <option value="protective">Protective</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
          placeholder="Tell others about your dog's personality, favorite activities, etc."
        />
        <div className="flex justify-between items-center mt-1">
          <span className={`text-sm ${formData.bio.length > 300 ? 'text-red-600' : 'text-gray-500'}`}>
            {formData.bio.length}/300
          </span>
        </div>
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
        )}
      </div>

      <div>
        <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">
          Photo
        </label>
        <input
          type="file"
          id="photo"
          name="photo"
          onChange={handleFileChange}
          accept="image/*"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Upload a photo of your dog (max 10MB, JPG/PNG/GIF)
        </p>
        {errors.photo && (
          <p className="mt-1 text-sm text-red-600">{errors.photo}</p>
        )}
        {dogProfile?.photo_url && (
          <div className="mt-2">
            <img
              src={dogProfile.photo_url}
              alt={`${dogProfile.name}`}
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
      >
        {isLoading ? (
          isEditing ? 'Updating Profile...' : 'Creating Profile...'
        ) : (
          isEditing ? 'Update Dog Profile' : 'Create Dog Profile'
        )}
      </button>
    </form>
  )
}