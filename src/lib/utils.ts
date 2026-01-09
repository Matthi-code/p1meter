import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Combineer class names met Tailwind merge */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format datum voor weergave */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

/** Format datum en tijd voor weergave */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

/** Format alleen tijd */
export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

/** Genereer unieke ID */
export function generateId(): string {
  return crypto.randomUUID()
}

/** Rol label in Nederlands */
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Administrator',
    planner: 'Planner',
    energiebuddy: 'Energie Buddy',
    huiseigenaar: 'Huiseigenaar',
  }
  return labels[role] || role
}

/** Status label in Nederlands */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    scheduled: 'Gepland',
    confirmed: 'Bevestigd',
    traveling: 'Onderweg',
    in_progress: 'Bezig',
    completed: 'Voltooid',
    cancelled: 'Geannuleerd',
    pending: 'Open',
    open: 'Open',
    resolved: 'Opgelost',
  }
  return labels[status] || status
}

/** Status kleur voor badges */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    traveling: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-gray-100 text-gray-800',
    open: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
