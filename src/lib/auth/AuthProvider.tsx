'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { db } from '@/lib/supabase/database'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile, GuestLoginOptions, AccountConversionData } from '@/types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isAnonymous: boolean
  canCreateDogs: boolean
  canMessage: boolean
  sessionExpiresAt?: Date
  signUp: (email: string, password: string, userData: SignUpData) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signInAsGuest: (options?: GuestLoginOptions) => Promise<{ error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  sendPasswordReset: (email: string) => Promise<{ error: Error | null }>
  convertToAccount: (data: AccountConversionData) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
}

interface SignUpData {
  firstName: string
  lastName: string
  location: string
  city?: string
  latitude?: number
  longitude?: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  // Computed properties for guest authentication
  const isAnonymous = Boolean(user?.is_anonymous || profile?.userType === 'guest')
  const canCreateDogs = !isAnonymous
  const canMessage = !isAnonymous
  const sessionExpiresAt = profile?.guestSessionExpiresAt
    ? new Date(profile.guestSessionExpiresAt)
    : undefined

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setProfile(null)
        setIsLoading(false)
      }

      // Handle email confirmation
      if (event === 'SIGNED_IN' && session?.user) {
        // Update email verification status if needed
        if (session.user.email_confirmed_at && profile && !profile.emailVerified) {
          await updateProfile({ emailVerified: true })
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const profileData = await db.profiles.getByUserId(userId)
      setProfile(profileData)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    try {
      setIsLoading(true)

      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            location: userData.location
          }
        }
      })

      if (authError) {
        return { error: authError }
      }

      if (authData.user) {
        // Create the profile record in our database
        try {
          const profileData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'> = {
            userId: authData.user.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: email,
            location: userData.location,
            city: userData.city || userData.location,
            latitude: userData.latitude,
            longitude: userData.longitude,
            authProvider: 'email',
            emailVerified: false,
            locationDisplay: userData.location
          }

          const newProfile = await db.profiles.create(profileData)
          setProfile(newProfile)
        } catch (profileError) {
          console.error('Error creating profile:', profileError)
          // Don't return error here - auth worked, profile creation can be retried
        }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { error }
    } catch (error) {
      return { error: error as Error }
    } finally {
      setIsLoading(false)
    }
  }

  const signInAsGuest = async (options: GuestLoginOptions = {}) => {
    try {
      setIsLoading(true)

      // Sign in anonymously with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously()

      if (authError) {
        return { error: authError }
      }

      if (authData.user) {
        // Create guest profile
        const sessionDuration = options.sessionDurationHours || 24
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + sessionDuration)

        try {
          const guestProfile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'> = {
            userId: authData.user.id,
            firstName: 'Guest',
            lastName: 'User',
            email: '', // Anonymous users don't have emails
            location: 'New Zealand',
            city: 'Auckland', // Default location
            authProvider: 'anonymous',
            emailVerified: false,
            userType: 'guest',
            guestSessionExpiresAt: expiresAt.toISOString()
          }

          const newProfile = await db.profiles.create(guestProfile)
          setProfile(newProfile)
        } catch (profileError) {
          console.error('Error creating guest profile:', profileError)
          // Don't return error here - auth worked, profile creation can be retried
        }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (!error) {
        setUser(null)
        setProfile(null)
        setSession(null)
      }
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!profile) {
        return { error: new Error('No profile to update') }
      }

      const updatedProfile = await db.profiles.update(profile.id, updates)
      setProfile(updatedProfile)
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const sendPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const convertToAccount = async (data: AccountConversionData) => {
    try {
      if (!user || !user.is_anonymous || !profile) {
        return { error: new Error('Can only convert anonymous users to permanent accounts') }
      }

      setIsLoading(true)

      // Link email/password to the anonymous account
      const { error: linkError } = await supabase.auth.linkIdentity({
        type: 'email',
        email: data.email,
        password: data.password,
      })

      if (linkError) {
        return { error: linkError }
      }

      // Update profile to permanent user
      const profileUpdates: Partial<Profile> = {
        email: data.email,
        firstName: data.firstName || profile.firstName,
        lastName: data.lastName || profile.lastName,
        userType: 'permanent',
        authProvider: 'email',
        emailVerified: false, // Will be verified via email confirmation
        convertedFromGuestAt: new Date().toISOString(),
        guestSessionExpiresAt: undefined
      }

      const updatedProfile = await db.profiles.update(profile.id, profileUpdates)
      setProfile(updatedProfile)

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    } finally {
      setIsLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id)
    }
  }

  const value = {
    user,
    profile,
    session,
    isLoading,
    isAnonymous,
    canCreateDogs,
    canMessage,
    sessionExpiresAt,
    signUp,
    signIn,
    signInAsGuest,
    signOut,
    updateProfile,
    sendPasswordReset,
    convertToAccount,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Convenience hook for protected routes
export function useRequireAuth() {
  const auth = useAuth()

  useEffect(() => {
    if (!auth.isLoading && !auth.user) {
      // Redirect to login page
      window.location.href = '/auth/login'
    }
  }, [auth.isLoading, auth.user])

  return auth
}