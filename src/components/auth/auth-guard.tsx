"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase/supabase"
import { Loader2 } from "lucide-react"

// Routes publiques (accessibles sans connexion)
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/info",
]

// Routes d'authentification (rediriger vers dashboard si déjà connecté)
const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
]

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/auth/")
        const isAuthRoute = AUTH_ROUTES.includes(pathname)

        if (!session && !isPublicRoute) {
          // Non connecté et route protégée -> rediriger vers login
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
          return
        }

        if (session && isAuthRoute) {
          // Connecté et sur page d'auth -> rediriger vers dashboard
          router.push("/dashboard")
          return
        }

        setIsAuthenticated(!!session || isPublicRoute)
      } catch (error) {
        console.error("Auth check error:", error)
        // En cas d'erreur, permettre l'accès aux routes publiques
        if (PUBLIC_ROUTES.includes(pathname)) {
          setIsAuthenticated(true)
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          if (!PUBLIC_ROUTES.includes(pathname)) {
            router.push("/login")
          }
        } else if (event === "SIGNED_IN" && AUTH_ROUTES.includes(pathname)) {
          router.push("/dashboard")
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          <p className="text-[#919191] text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          <p className="text-[#919191] text-sm">Redirection...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}