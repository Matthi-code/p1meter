'use client'

import { AuthProvider } from '@/lib/auth'
import type { ReactNode } from 'react'

type ProvidersProps = {
  children: ReactNode
}

/** Wrapper voor alle client-side providers */
export function Providers({ children }: ProvidersProps) {
  return <AuthProvider>{children}</AuthProvider>
}
