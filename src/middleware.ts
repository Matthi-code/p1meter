import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Publieke routes die geen authenticatie vereisen
const publicRoutes = [
  '/',
  '/login',
  '/reset-password',
  '/faq',
  '/over',
  '/instructions',
  '/portal',        // Token-based auth (handled in portal layout)
  '/portal-login',  // Portal login page
]

// Routes die alleen voor specifieke rollen zijn
const dashboardRoutes = ['/dashboard', '/calendar', '/installations', '/tasks', '/customers', '/team']
const portalRoutes = ['/portal']
const adminOnlyRoutes = ['/team']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check of het een publieke route is
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // Statische bestanden en API routes overslaan
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // bestanden zoals .css, .js, etc.
  ) {
    return NextResponse.next()
  }

  // Maak Supabase client voor middleware
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Haal sessie op
  const { data: { session } } = await supabase.auth.getSession()

  // Publieke routes zijn altijd toegankelijk
  if (isPublicRoute) {
    return response
  }

  // Niet ingelogd → redirect naar home (landing page)
  if (!session) {
    const redirectUrl = new URL('/', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Haal gebruikersrol op uit team_members
  const { data: teamMember } = await supabase
    .from('team_members')
    .select('role')
    .eq('user_id', session.user.id)
    .single()

  const userRole = teamMember?.role || 'huiseigenaar'

  // Check dashboard routes (alleen admin, planner, energiebuddy)
  const isDashboardRoute = dashboardRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isDashboardRoute) {
    // Admin-only routes
    const isAdminOnly = adminOnlyRoutes.some(route =>
      pathname === route || pathname.startsWith(`${route}/`)
    )

    if (isAdminOnly && userRole !== 'admin') {
      // Niet admin → redirect naar dashboard
      const redirectUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Alleen admin, planner, energiebuddy mogen dashboard zien
    if (!['admin', 'planner', 'energiebuddy'].includes(userRole)) {
      // Huiseigenaar → redirect naar portal
      const redirectUrl = new URL('/portal', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Check portal routes (huiseigenaar en hoger)
  const isPortalRoute = portalRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isPortalRoute) {
    // Alle ingelogde gebruikers mogen portal zien
    // (huiseigenaar, energiebuddy, planner, admin)
    return response
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
