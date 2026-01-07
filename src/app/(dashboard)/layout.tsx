'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { getRoleLabel } from '@/lib/utils'
import { useState } from 'react'
import {
  Calendar,
  Users,
  Wrench,
  CheckSquare,
  UserCog,
  LogOut,
  Zap,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
} from 'lucide-react'
import type { ReactNode } from 'react'

type NavItem = {
  href: string
  label: string
  icon: ReactNode
  roles?: string[]
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: '/calendar',
    label: 'Kalender',
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    href: '/installations',
    label: 'Installaties',
    icon: <Wrench className="h-5 w-5" />,
  },
  {
    href: '/tasks',
    label: 'Taken',
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    href: '/customers',
    label: 'Klanten',
    icon: <Users className="h-5 w-5" />,
  },
  {
    href: '/team',
    label: 'Team',
    icon: <UserCog className="h-5 w-5" />,
    roles: ['admin'],
  },
]

type DashboardLayoutProps = {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { user, logout, hasRole } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Filter nav items op rol
  const visibleNavItems = navItems.filter(
    (item) => !item.roles || hasRole(item.roles as any)
  )

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-slate-900 text-white shadow-lg"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar backdrop (mobile) */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 flex flex-col z-40 transform transition-transform duration-300 ease-in-out bg-gradient-to-b from-slate-900 to-slate-950 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 p-2.5 rounded-xl">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <span className="font-bold text-xl text-white">p1Meter</span>
              <span className="block text-xs text-slate-400">Installatie Manager</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="px-4 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Menu
          </p>
          <ul className="space-y-1">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'text-white bg-white/10 shadow-lg shadow-black/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                    )}
                    <span className={`transition-colors ${isActive ? 'text-blue-400' : 'group-hover:text-blue-400'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                    {isActive && (
                      <ChevronRight className="h-4 w-4 ml-auto text-slate-500" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-white/10">
          {user && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-400">
                  {getRoleLabel(user.role)}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Uitloggen"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <div className="relative flex-1 lg:ml-0 ml-12">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="Zoeken..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-100 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* User info badge */}
              {user && (
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{getRoleLabel(user.role)}</p>
                  </div>
                </div>
              )}
              {!user && (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Inloggen
                </Link>
              )}
              <button className="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
