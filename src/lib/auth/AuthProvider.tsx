'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { db } from '@/lib/supabase/database'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string, userData: SignUpData) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  sendPasswordReset: (email: string) => Promise<{ error: Error | null }>
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
    signUp,
    signIn,
    signOut,
    updateProfile,
    sendPasswordReset,
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