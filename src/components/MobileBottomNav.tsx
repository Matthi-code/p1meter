'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import {
  LayoutDashboard,
  CalendarCheck,
  Wrench,
  CheckSquare,
  Calendar,
  Users,
} from 'lucide-react'

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
}

function getNavItems(role: string): NavItem[] {
  if (role === 'energiebuddy') {
    return [
      { href: '/dashboard', label: 'Home', icon: <LayoutDashboard className="h-5 w-5" /> },
      { href: '/today', label: 'Mijn Dag', icon: <CalendarCheck className="h-5 w-5" /> },
      { href: '/installations', label: 'Installaties', icon: <Wrench className="h-5 w-5" /> },
      { href: '/tasks', label: 'Taken', icon: <CheckSquare className="h-5 w-5" /> },
    ]
  }

  return [
    { href: '/dashboard', label: 'Home', icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: '/calendar', label: 'Kalender', icon: <Calendar className="h-5 w-5" /> },
    { href: '/installations', label: 'Installaties', icon: <Wrench className="h-5 w-5" /> },
    { href: '/customers', label: 'Klanten', icon: <Users className="h-5 w-5" /> },
  ]
}

export function MobileBottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null

  const navItems = getNavItems(user.role)

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                isActive
                  ? 'text-blue-600'
                  : 'text-slate-400 active:text-slate-600'
              }`}
            >
              <span className={isActive ? 'text-blue-600' : ''}>
                {item.icon}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-12 h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
