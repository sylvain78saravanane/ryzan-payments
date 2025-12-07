"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Settings2, LogOut, User, UserCircle } from 'lucide-react'
import { supabase } from "@/lib/supabase/supabase"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export function DashboardHeader() {
  const router = useRouter()
  const { profile, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  const getInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`
    }
    return "U"
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-black/10 backdrop-blur-[120px]">
      {/* Logo Ryzan */}
      <Link href="/dashboard" className="flex items-center gap-2">
        <Image 
          src="/ryzan.png" 
          width={150} 
          height={40} 
          alt="Ryzan Logo"
          className="h-8 w-auto"
        />
      </Link>

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-orange-400 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/20 flex items-center justify-center text-white font-semibold">
            {getInitials()}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-[#0D0D0D] border-[#1F1F1F] text-white">
          {profile && (
            <>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-white">
                    {profile.firstName} {profile.lastName}
                  </p>
                  <p className="text-xs text-[#919191] truncate">
                    {profile.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#1F1F1F]" />
            </>
          )}
          
          <DropdownMenuItem 
            className="focus:bg-[#1F1F1F] focus:text-white cursor-pointer text-[#919191]"
            onClick={() => router.push("/profil")}
          >
            <UserCircle className="mr-2 h-4 w-4 text-[#919191]" />
            <span>Mon Profil</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="focus:bg-[#1F1F1F] focus:text-white cursor-pointer text-[#919191]"
            onClick={() => router.push("/settings")}
          >
            <Settings2 className="mr-2 h-4 w-4 text-[#919191]" />
            <span>Paramètres</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-[#1F1F1F]" />
          
          <DropdownMenuItem 
            className="focus:bg-[#1F1F1F] focus:text-white cursor-pointer text-red-400"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4 text-red-400" />
            <span>Déconnexion</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}