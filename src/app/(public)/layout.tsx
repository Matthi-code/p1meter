import Link from 'next/link'
import { Zap } from 'lucide-react'
import type { ReactNode } from 'react'

type PublicLayoutProps = {
  children: ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">p1Meter</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/faq"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                FAQ
              </Link>
              <Link
                href="/over"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Over ons
              </Link>
            </nav>

            {/* Login button */}
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Inloggen
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-500 p-2 rounded-xl">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl">p1Meter</span>
              </div>
              <p className="text-slate-400 text-sm max-w-md">
                Professionele installatie en beheer van p1Meters bij huiseigenaren.
                Realtime inzicht in energieverbruik met de HomeWizard app.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Navigatie</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-slate-400 hover:text-white text-sm transition-colors">
                    Veelgestelde vragen
                  </Link>
                </li>
                <li>
                  <Link href="/over" className="text-slate-400 hover:text-white text-sm transition-colors">
                    Over ons
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>info@p1meter-installaties.nl</li>
                <li>088 - 123 4567</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} p1Meter Installaties. Alle rechten voorbehouden.
          </div>
        </div>
      </footer>
    </div>
  )
}
