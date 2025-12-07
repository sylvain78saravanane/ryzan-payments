"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/supabase"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  walletAddress?: string
  phone?: string
  country?: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Récupérer le profil utilisateur depuis les métadonnées Supabase
  const fetchProfile = async (currentUser: User) => {
    try {
      const metadata = currentUser.user_metadata
      
      const userProfile: UserProfile = {
        id: currentUser.id,
        email: currentUser.email || "",
        firstName: metadata?.first_name || metadata?.firstName || "",
        lastName: metadata?.last_name || metadata?.lastName || "",
        avatarUrl: metadata?.avatar_url || metadata?.avatarUrl,
        walletAddress: metadata?.wallet_address || metadata?.walletAddress,
        phone: metadata?.phone,
        country: metadata?.country,
        createdAt: currentUser.created_at,
      }
      
      setProfile(userProfile)
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  // Rafraîchir le profil
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user)
    }
  }

  // Mettre à jour le profil
  const updateProfile = async (data: Partial<UserProfile>): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          avatar_url: data.avatarUrl,
          wallet_address: data.walletAddress,
          phone: data.phone,
          country: data.country,
        }
      })

      if (error) throw error

      // Rafraîchir le profil après la mise à jour
      const { data: { user: updatedUser } } = await supabase.auth.getUser()
      if (updatedUser) {
        await fetchProfile(updatedUser)
        setUser(updatedUser)
      }

      return { error: null }
    } catch (error) {
      console.error("Error updating profile:", error)
      return { error: error as Error }
    }
  }

  // Déconnexion
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
    router.push("/login")
  }

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        setSession(currentSession)
        
        if (currentSession?.user) {
          setUser(currentSession.user)
          await fetchProfile(currentSession.user)
        }
      } catch (error) {
        console.error("Error getting session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession)
        
        if (currentSession?.user) {
          setUser(currentSession.user)
          await fetchProfile(currentSession.user)
        } else {
          setUser(null)
          setProfile(null)
        }

        // Gérer les événements spécifiques
        if (event === "SIGNED_OUT") {
          router.push("/login")
        } else if (event === "SIGNED_IN") {
          router.push("/dashboard")
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        signOut,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}