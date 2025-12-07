"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Blocks, Wallet, SquareArrowOutUpRight, Settings2, LogOut, BotIcon, Users, UserCircle } from 'lucide-react'
import { supabase } from "@/lib/supabase/supabase"

const navItems = [
  { icon: Blocks, label: "DASHBOARD", href: "/dashboard" },
  { icon: Wallet, label: "TRANSACTIONS", href: "/transactions" },
  { icon: Users, label: "RECIPIENTS", href: "/recipients" },
  { icon: BotIcon, label: "AGENT AI", href: "/agent" },
]

const bottomItems = [
  { icon: SquareArrowOutUpRight, label: "RYZAN SUPPORT", href: "https://ryzan.io/support", external: true },
  { icon: Settings2, label: "SETTINGS", href: "/profil" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const isActive = (href: string) => pathname === href

  return (
    <aside className="sticky top-24 h-[calc(100vh-8rem)] md:w-48 lg:w-64 bg-[#0D0D0D] rounded-2xl hidden md:flex flex-col p-8 overflow-y-auto">
      <nav className="flex flex-col gap-8">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-4 transition-colors cursor-pointer ${
              isActive(item.href) 
                ? "text-[#E7E7E7]" 
                : "text-[#919191] hover:text-[#E7E7E7]"
            }`}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-sm font-medium tracking-wide">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-[#1F1F1F] flex flex-col gap-8">
        {bottomItems.map((item) => (
          item.external ? (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 text-[#919191] hover:text-[#E7E7E7] transition-colors cursor-pointer"
            >
              <item.icon className="h-6 w-6" />
              <span className="text-sm font-medium tracking-wide">{item.label}</span>
            </a>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 transition-colors cursor-pointer ${
                isActive(item.href) 
                  ? "text-[#E7E7E7]" 
                  : "text-[#919191] hover:text-[#E7E7E7]"
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-sm font-medium tracking-wide">{item.label}</span>
            </Link>
          )
        ))}
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 text-[#919191] hover:text-red-400 transition-colors cursor-pointer"
        >
          <LogOut className="h-6 w-6" />
          <span className="text-sm font-medium tracking-wide">LOGOUT</span>
        </button>
      </div>
    </aside>
  )
}