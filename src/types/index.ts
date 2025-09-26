// Database types based on Supabase schema
export interface Profile {
  id: string
  firstName: string
  lastName: string
  email: string
  location: string
  bio?: string
  profilePhoto?: string
  createdAt: string
  updatedAt: string
}

export interface Dog {
  id: string
  ownerId: string
  name: string
  primaryBreed: string
  secondaryBreed?: string
  age: number
  size: 'small' | 'medium' | 'large'
  weight?: number
  temperament: string[]
  photos: string[]
  vaccinationStatus: 'up-to-date' | 'overdue' | 'unknown'
  neutered: boolean
  bio?: string
  location: {
    lat: number
    lng: number
  }
  createdAt: string
  updatedAt: string
  owner?: Profile
}

export interface Conversation {
  id: string
  participant1Id: string
  participant2Id: string
  lastMessageAt: string
  createdAt: string
  participant1?: Profile
  participant2?: Profile
  messages?: Message[]
  lastMessage?: Message
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
  sender?: Profile
}

export interface Friendship {
  id: string
  requesterId: string
  addresseeId: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
  updatedAt: string
  requester?: Profile
  addressee?: Profile
}

// UI/Form types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  firstName: string
  lastName: string
  location: string
}

export interface DogFormData {
  name: string
  primaryBreed: string
  secondaryBreed?: string
  age: number
  size: 'small' | 'medium' | 'large'
  weight?: number
  temperament: string[]
  photos: File[]
  vaccinationStatus: 'up-to-date' | 'overdue' | 'unknown'
  neutered: boolean
  bio?: string
}

export interface SearchFilters {
  location?: string
  maxDistance?: number
  size?: string[]
  ageRange?: {
    min: number
    max: number
  }
  temperament?: string[]
  vaccinatedOnly?: boolean
}