import { createClient } from './client'
import type {
  Profile,
  Dog,
  Vaccination,
  WormingTreatment,
  FleaTreatment,
  Friendship,
  Conversation,
  Message,
  Notification,
  BlockedUser,
  ReportedUser
} from '@/types'

const supabase = createClient()

// =========================================
// DATABASE OPERATIONS
// Type-safe database operations using our enhanced schema
// =========================================

export const db = {
  // =========================================
  // PROFILES
  // =========================================
  profiles: {
    async getById(id: string): Promise<Profile | null> {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },

    async getByUserId(userId: string): Promise<Profile | null> {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data
    },

    async create(profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<Profile> {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          user_id: profile.userId,
          first_name: profile.firstName,
          last_name: profile.lastName,
          email: profile.email,
          city: profile.city,
          location: profile.location,
          location_display: profile.locationDisplay,
          latitude: profile.latitude,
          longitude: profile.longitude,
          age: profile.age,
          bio: profile.bio,
          profile_photo: profile.profilePhoto,
          auth_provider: profile.authProvider,
          email_verified: profile.emailVerified
        }])
        .select()
        .single()

      if (error) throw error
      return data
    },

    async update(id: string, updates: Partial<Profile>): Promise<Profile> {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          city: updates.city,
          location: updates.location,
          location_display: updates.locationDisplay,
          latitude: updates.latitude,
          longitude: updates.longitude,
          age: updates.age,
          bio: updates.bio,
          profile_photo: updates.profilePhoto
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    }
  },

  // =========================================
  // DOGS
  // =========================================
  dogs: {
    async getById(id: string): Promise<Dog | null> {
      const { data, error } = await supabase
        .from('dogs')
        .select(`
          *,
          owner:profiles(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },

    async getByOwnerId(ownerId: string): Promise<Dog[]> {
      const { data, error } = await supabase
        .from('dogs')
        .select(`
          *,
          owner:profiles(*)
        `)
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },

    async getAll(limit: number = 50): Promise<Dog[]> {
      const { data, error } = await supabase
        .from('dogs')
        .select(`
          *,
          owner:profiles(first_name, last_name, city)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    },

    async findNearby(latitude: number, longitude: number, radiusKm: number = 10): Promise<Dog[]> {
      // Use the Haversine formula function we created in the migration
      const { data, error } = await supabase
        .rpc('find_dogs_within_radius', {
          user_lat: latitude,
          user_lng: longitude,
          radius_km: radiusKm
        })

      if (error) throw error
      return data || []
    },

    async create(dog: Omit<Dog, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dog> {
      const { data, error } = await supabase
        .from('dogs')
        .insert([{
          owner_id: dog.ownerId,
          name: dog.name,
          primary_breed: dog.primaryBreed,
          secondary_breed: dog.secondaryBreed,
          age: dog.age,
          date_of_birth: dog.dateOfBirth,
          size: dog.size,
          weight: dog.weight,
          temperament: dog.temperament,
          energy_level: dog.energyLevel,
          training_level: dog.trainingLevel,
          socialization: dog.socialization,
          good_with_kids: dog.goodWithKids,
          good_with_dogs: dog.goodWithDogs,
          good_with_cats: dog.goodWithCats,
          interaction_styles: dog.interactionStyles,
          vaccination_status: dog.vaccinationStatus,
          vaccinated: dog.vaccinated,
          neutered: dog.neutered,
          puppy_not_vaccinated: dog.puppyNotVaccinated,
          photos: dog.photos,
          bio: dog.bio,
          location_lat: dog.location.lat,
          location_lng: dog.location.lng,
          location_display: dog.locationDisplay
        }])
        .select()
        .single()

      if (error) throw error
      return data
    },

    async update(id: string, updates: Partial<Dog>): Promise<Dog> {
      const updateData: any = {}

      if (updates.name) updateData.name = updates.name
      if (updates.primaryBreed) updateData.primary_breed = updates.primaryBreed
      if (updates.secondaryBreed) updateData.secondary_breed = updates.secondaryBreed
      if (updates.age) updateData.age = updates.age
      if (updates.dateOfBirth) updateData.date_of_birth = updates.dateOfBirth
      if (updates.size) updateData.size = updates.size
      if (updates.weight) updateData.weight = updates.weight
      if (updates.temperament) updateData.temperament = updates.temperament
      if (updates.energyLevel) updateData.energy_level = updates.energyLevel
      if (updates.trainingLevel) updateData.training_level = updates.trainingLevel
      if (updates.socialization) updateData.socialization = updates.socialization
      if (updates.goodWithKids !== undefined) updateData.good_with_kids = updates.goodWithKids
      if (updates.goodWithDogs !== undefined) updateData.good_with_dogs = updates.goodWithDogs
      if (updates.goodWithCats !== undefined) updateData.good_with_cats = updates.goodWithCats
      if (updates.interactionStyles) updateData.interaction_styles = updates.interactionStyles
      if (updates.vaccinationStatus) updateData.vaccination_status = updates.vaccinationStatus
      if (updates.vaccinated !== undefined) updateData.vaccinated = updates.vaccinated
      if (updates.neutered !== undefined) updateData.neutered = updates.neutered
      if (updates.puppyNotVaccinated !== undefined) updateData.puppy_not_vaccinated = updates.puppyNotVaccinated
      if (updates.photos) updateData.photos = updates.photos
      if (updates.bio) updateData.bio = updates.bio
      if (updates.location) {
        updateData.location_lat = updates.location.lat
        updateData.location_lng = updates.location.lng
      }
      if (updates.locationDisplay) updateData.location_display = updates.locationDisplay

      const { data, error } = await supabase
        .from('dogs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase
        .from('dogs')
        .delete()
        .eq('id', id)

      if (error) throw error
    }
  },

  // =========================================
  // HEALTH RECORDS
  // =========================================
  health: {
    // Vaccinations
    async getVaccinations(dogId: string): Promise<Vaccination[]> {
      const { data, error } = await supabase
        .from('vaccinations')
        .select('*')
        .eq('dog_id', dogId)
        .order('date', { ascending: false })

      if (error) throw error
      return data || []
    },

    async addVaccination(vaccination: Omit<Vaccination, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vaccination> {
      const { data, error } = await supabase
        .from('vaccinations')
        .insert([{
          dog_id: vaccination.dogId,
          name: vaccination.name,
          date: vaccination.date,
          frequency: vaccination.frequency,
          clinic: vaccination.clinic,
          next_due_date: vaccination.nextDueDate
        }])
        .select()
        .single()

      if (error) throw error
      return data
    },

    // Worming treatments
    async getWormingTreatments(dogId: string): Promise<WormingTreatment[]> {
      const { data, error } = await supabase
        .from('worming_treatments')
        .select('*')
        .eq('dog_id', dogId)
        .order('date', { ascending: false })

      if (error) throw error
      return data || []
    },

    async addWormingTreatment(treatment: Omit<WormingTreatment, 'id' | 'createdAt' | 'updatedAt'>): Promise<WormingTreatment> {
      const { data, error } = await supabase
        .from('worming_treatments')
        .insert([{
          dog_id: treatment.dogId,
          name: treatment.name,
          date: treatment.date,
          frequency: treatment.frequency,
          next_due_date: treatment.nextDueDate
        }])
        .select()
        .single()

      if (error) throw error
      return data
    },

    // Flea treatments
    async getFleaTreatments(dogId: string): Promise<FleaTreatment[]> {
      const { data, error } = await supabase
        .from('flea_treatments')
        .select('*')
        .eq('dog_id', dogId)
        .order('date', { ascending: false })

      if (error) throw error
      return data || []
    },

    async addFleaTreatment(treatment: Omit<FleaTreatment, 'id' | 'createdAt' | 'updatedAt'>): Promise<FleaTreatment> {
      const { data, error } = await supabase
        .from('flea_treatments')
        .insert([{
          dog_id: treatment.dogId,
          name: treatment.name,
          date: treatment.date,
          frequency: treatment.frequency,
          next_due_date: treatment.nextDueDate
        }])
        .select()
        .single()

      if (error) throw error
      return data
    }
  },

  // =========================================
  // SOCIAL FEATURES
  // =========================================
  social: {
    // Friendships
    async getFriendships(userId: string): Promise<Friendship[]> {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          user:profiles!user_id(*),
          friend_user:profiles!friend_user_id(*)
        `)
        .or(`user_id.eq.${userId},friend_user_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },

    async sendFriendRequest(userId: string, friendUserId: string, contextDogId?: string): Promise<Friendship> {
      const { data, error } = await supabase
        .from('friendships')
        .insert([{
          user_id: userId,
          friend_user_id: friendUserId,
          context_dog_id: contextDogId,
          status: 'pending'
        }])
        .select()
        .single()

      if (error) throw error
      return data
    },

    // Messaging
    async getConversations(userId: string): Promise<Conversation[]> {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant1:profiles!participant1_id(*),
          participant2:profiles!participant2_id(*),
          messages(*, sender:profiles(*))
        `)
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false })

      if (error) throw error
      return data || []
    },

    async getMessages(conversationId: string): Promise<Message[]> {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    },

    async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: senderId,
          content: content
        }])
        .select()
        .single()

      if (error) throw error
      return data
    }
  }
}

// =========================================
// LOCATION UTILITIES
// =========================================

export const location = {
  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLng = this.toRadians(lng2 - lng1)
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  },

  toRadians(degrees: number): number {
    return degrees * (Math.PI/180)
  }
}

// =========================================
// NOMINATIM INTEGRATION
// Free NZ address lookup
// =========================================

export interface NominatimResult {
  display_name: string
  lat: string
  lon: string
  address: {
    house_number?: string
    road?: string
    suburb?: string
    city?: string
    postcode?: string
    country: string
  }
}

export const nominatim = {
  async searchNZAddresses(query: string): Promise<NominatimResult[]> {
    const params = new URLSearchParams({
      q: query,
      countrycodes: 'nz',
      format: 'json',
      addressdetails: '1',
      limit: '8'
    })

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          'User-Agent': 'SocialDog-NZ/1.0'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Address search failed')
    }

    return response.json()
  },

  formatDisplayName(result: NominatimResult): string {
    const { address } = result
    const parts = []

    if (address.house_number && address.road) {
      parts.push(`${address.house_number} ${address.road}`)
    } else if (address.road) {
      parts.push(address.road)
    }

    if (address.suburb) parts.push(address.suburb)
    if (address.city) parts.push(address.city)
    if (address.postcode) parts.push(address.postcode)

    return parts.join(', ')
  }
}