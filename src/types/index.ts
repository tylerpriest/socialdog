// Database types based on Supabase schema
export interface Profile {
  id: string
  firstName: string
  lastName: string
  email: string
  location: string
  city: string
  latitude?: number
  longitude?: number
  age?: number
  bio?: string
  profilePhoto?: string | null
  authProvider: 'email' | 'google'
  emailVerified: boolean
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
  dateOfBirth: string // YYYY-MM-DD for precise age tracking
  size: 'small' | 'medium' | 'large' | 'extra-large' // Added extra-large for compatibility
  weight?: number
  temperament: string[]
  photos: string[]

  // Legacy compatibility fields (to be migrated)
  breed?: string // Maps to primaryBreed
  gender?: 'male' | 'female' // Will be migrated to separate field
  photo_url?: string // Maps to photos[0]

  // Health status
  vaccinationStatus: 'up-to-date' | 'overdue' | 'unknown'
  vaccinated: boolean
  neutered: boolean
  puppyNotVaccinated: boolean // Special case for young puppies

  // Behavioral compatibility (CRITICAL for matching)
  energyLevel: 'low' | 'medium' | 'high'
  trainingLevel: 'basic' | 'intermediate' | 'advanced' | 'professional'
  socialization: 'excellent' | 'good' | 'needs_work'

  // Compatibility flags
  goodWithKids: boolean
  goodWithDogs: boolean
  goodWithCats: boolean

  // Interaction preferences
  interactionStyles: string[] // ['fetch', 'tug-of-war', 'wrestling', 'chase']

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
  userId: string
  friendUserId: string
  contextDogId?: string // Which dog initiated the friendship
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
  updatedAt: string
  user?: Profile
  friendUser?: Profile
  contextDog?: Dog
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
  dateOfBirth?: string // Optional during transition
  size: 'small' | 'medium' | 'large' | 'extra-large'
  weight?: number
  temperament: string[]
  photos: File[]

  // Legacy compatibility fields (to be migrated)
  breed?: string // Maps to primaryBreed
  gender?: 'male' | 'female' // Will be migrated to separate field

  // Health fields - optional during transition
  vaccinationStatus?: 'up-to-date' | 'overdue' | 'unknown'
  vaccinated?: boolean
  neutered?: boolean
  puppyNotVaccinated?: boolean

  // Behavioral compatibility - optional during transition
  energyLevel?: 'low' | 'medium' | 'high'
  trainingLevel?: 'basic' | 'intermediate' | 'advanced' | 'professional'
  socialization?: 'excellent' | 'good' | 'needs_work'

  // Compatibility flags - optional during transition
  goodWithKids?: boolean
  goodWithDogs?: boolean
  goodWithCats?: boolean

  // Interaction preferences - optional during transition
  interactionStyles?: string[]

  bio?: string
}

// Health form data types
export interface VaccinationFormData {
  name: string
  date: string
  frequency: 'monthly' | 'annually' | 'every_2_years'
  clinic?: string
}

export interface WormingTreatmentFormData {
  name: string
  date: string
  frequency: 'monthly' | 'every_2_months' | 'every_3_months' | 'every_6_months' | 'annually'
}

export interface FleaTreatmentFormData {
  name: string
  date: string
  frequency: 'monthly' | 'every_2_months' | 'every_3_months' | 'every_6_months' | 'annually'
}

// Health record types
export interface Vaccination {
  id: string
  dogId: string
  name: string
  date: string // YYYY-MM-DD
  frequency: 'monthly' | 'annually' | 'every_2_years'
  clinic?: string
  nextDueDate: string // Calculated field
  createdAt: string
  updatedAt: string
}

export interface WormingTreatment {
  id: string
  dogId: string
  name: string
  date: string // YYYY-MM-DD
  frequency: 'monthly' | 'every_2_months' | 'every_3_months' | 'every_6_months' | 'annually'
  nextDueDate: string // Calculated field
  createdAt: string
  updatedAt: string
}

export interface FleaTreatment {
  id: string
  dogId: string
  name: string
  date: string // YYYY-MM-DD
  frequency: 'monthly' | 'every_2_months' | 'every_3_months' | 'every_6_months' | 'annually'
  nextDueDate: string // Calculated field
  createdAt: string
  updatedAt: string
}

// Social features
export interface Notification {
  id: string
  userId: string
  type: 'friend_request' | 'friend_accepted' | 'match_request' | 'message' | 'health_reminder'
  title: string
  message: string
  relatedUserId?: string
  relatedDogId?: string
  isRead: boolean
  createdAt: string
}

export interface BlockedUser {
  id: string
  userId: string
  blockedUserId: string
  createdAt: string
}

export interface ReportedUser {
  id: string
  reporterId: string
  reportedUserId: string
  reason: string
  status: 'pending' | 'reviewed' | 'resolved'
  adminNotes?: string
  createdAt: string
  reviewedAt?: string
}

// Authentication
export interface PasswordResetToken {
  id: string
  userId: string
  token: string
  expiresAt: string
  used: boolean
  createdAt: string
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

  // Advanced behavioral filters
  energyLevel?: ('low' | 'medium' | 'high')[]
  trainingLevel?: ('basic' | 'intermediate' | 'advanced' | 'professional')[]
  socialization?: ('excellent' | 'good' | 'needs_work')[]
  goodWithKids?: boolean
  goodWithDogs?: boolean
  goodWithCats?: boolean
  interactionStyles?: string[]
}