'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { getRoleLabel } from '@/lib/utils'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useCustomers, useInstallations, useTasks, useTeamMembers } from '@/hooks/useData'
import {
  Calendar,
  CalendarCheck,
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
  MapPin,
  User,
  Clock,
  HelpCircle,
  Star,
  FileText,
  BarChart3,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { MobileBottomNav } from '@/components/MobileBottomNav'

type NavItem = {
  href: string
  label: string
  icon: ReactNode
}

// Role-based navigation - different menu items per role
function getNavItems(role: string): NavItem[] {
  // Energie Buddy sees focused, task-oriented navigation
  if (role === 'energiebuddy') {
    return [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
      {
        href: '/today',
        label: 'Mijn Dag',
        icon: <CalendarCheck className="h-5 w-5" />,
      },
      {
        href: '/installations',
        label: 'Mijn Installaties',
        icon: <Wrench className="h-5 w-5" />,
      },
      {
        href: '/tasks',
        label: 'Mijn Taken',
        icon: <CheckSquare className="h-5 w-5" />,
      },
    ]
  }

  // Planner and Admin see full navigation
  const items: NavItem[] = [
    {
      href: '/dashboard',
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
      href: '/customers',
      label: 'Klanten',
      icon: <Users className="h-5 w-5" />,
    },
    {
      href: '/tasks',
      label: 'Taken',
      icon: <CheckSquare className="h-5 w-5" />,
    },
    {
      href: '/evaluations',
      label: 'Evaluaties',
      icon: <Star className="h-5 w-5" />,
    },
  ]

  // Admin also sees Team management, Reports, and CMS
  if (role === 'admin') {
    items.push({
      href: '/team',
      label: 'Team',
      icon: <UserCog className="h-5 w-5" />,
    })
    items.push({
      href: '/reports',
      label: 'Rapportages',
      icon: <BarChart3 className="h-5 w-5" />,
    })
    items.push({
      href: '/cms',
      label: 'Content',
      icon: <FileText className="h-5 w-5" />,
    })
  }

  return items
}

type DashboardLayoutProps = {
  children: ReactNode
}

type SearchResult = {
  type: 'customer' | 'installation' | 'task' | 'team'
  id: string
  title: string
  subtitle: string
  href: string
  icon: ReactNode
}

function GlobalSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: customers } = useCustomers()
  const { data: installations } = useInstallations()
  const { data: tasks } = useTasks()
  const { data: teamMembers } = useTeamMembers()

  // Search results
  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim() || query.length < 2) return []

    const q = query.toLowerCase()
    const items: SearchResult[] = []

    // Search customers
    customers?.slice(0, 50).forEach((c) => {
      if (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      ) {
        items.push({
          type: 'customer',
          id: c.id,
          title: c.name,
          subtitle: `${c.city} - ${c.email}`,
          href: '/customers',
          icon: <Users className="h-4 w-4 text-blue-500" />,
        })
      }
    })

    // Search installations
    installations?.slice(0, 50).forEach((i) => {
      const customerName = i.customer?.name || 'Onbekende klant'
      if (
        customerName.toLowerCase().includes(q) ||
        i.customer?.city?.toLowerCase().includes(q) ||
        i.assignee?.name?.toLowerCase().includes(q)
      ) {
        items.push({
          type: 'installation',
          id: i.id,
          title: customerName,
          subtitle: `${new Date(i.scheduled_at).toLocaleDateString('nl-NL')} - ${i.customer?.city || ''}`,
          href: '/installations',
          icon: <Wrench className="h-4 w-4 text-emerald-500" />,
        })
      }
    })

    // Search tasks
    tasks?.slice(0, 50).forEach((t) => {
      if (
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.assignee?.name?.toLowerCase().includes(q)
      ) {
        items.push({
          type: 'task',
          id: t.id,
          title: t.title,
          subtitle: t.assignee?.name || 'Niet toegewezen',
          href: '/tasks',
          icon: <CheckSquare className="h-4 w-4 text-amber-500" />,
        })
      }
    })

    // Search team members
    teamMembers?.forEach((m) => {
      if (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
      ) {
        items.push({
          type: 'team',
          id: m.id,
          title: m.name,
          subtitle: m.email,
          href: '/team',
          icon: <User className="h-4 w-4 text-violet-500" />,
        })
      }
    })

    return items.slice(0, 8)
  }, [query, customers, installations, tasks, teamMembers])

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % results.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          router.push(results[selectedIndex].href)
          setQuery('')
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  function handleSelect(result: SearchResult) {
    router.push(result.href)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className="relative flex-1 lg:ml-0 ml-10 sm:ml-12">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        ref={inputRef}
        type="search"
        placeholder="Zoeken..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-sm bg-slate-100 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
      />

      {/* Search results dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
        >
          <div className="py-2">
            {results.map((result, index) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleSelect(result)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  {result.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {result.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {result.subtitle}
                  </p>
                </div>
                <span className="text-[10px] font-medium text-slate-400 uppercase">
                  {result.type === 'customer' && 'Klant'}
                  {result.type === 'installation' && 'Installatie'}
                  {result.type === 'task' && 'Taak'}
                  {result.type === 'team' && 'Team'}
                </span>
              </button>
            ))}
          </div>
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 text-[10px] font-mono">↑↓</kbd>
              {' '}navigeren {' '}
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 text-[10px] font-mono">Enter</kbd>
              {' '}selecteren
            </p>
          </div>
        </div>
      )}

      {/* No results message */}
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
        >
          <div className="px-4 py-6 text-center">
            <Search className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Geen resultaten voor &quot;{query}&quot;</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { user, logout, hasRole, isLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Redirect naar startpagina als niet ingelogd (fallback voor middleware)
  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = '/'
    }
  }, [user, isLoading])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Laden...</p>
        </div>
      </div>
    )
  }

  // Niet ingelogd
  if (!user) {
    return null
  }

  // Get nav items based on user role
  const visibleNavItems = getNavItems(user.role)

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
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <GlobalSearch />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* User info badge */}
              {user && (
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{getRoleLabel(user.role)}</p>
                  </div>
                </div>
              )}
              {!user && (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Inloggen
                </Link>
              )}
              <Link
                href="/faq"
                className="p-2 sm:p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                title="Veelgestelde vragen"
              >
                <HelpCircle className="h-5 w-5" />
              </Link>
              <button className="relative p-2 sm:p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">{children}</div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </div>
  )
}
