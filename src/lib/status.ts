// Centralized status configuration - single source of truth
import type { InstallationStatus, TaskStatus, IssueStatus } from '@/types/database'

export type StatusType = InstallationStatus | TaskStatus | IssueStatus

export const installationStatusConfig: Record<InstallationStatus, {
  label: string
  bg: string
  text: string
  dot: string
  calendarColor: string
}> = {
  scheduled: {
    label: 'Gepland',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    dot: 'bg-blue-500',
    calendarColor: '#3b82f6',
  },
  confirmed: {
    label: 'Bevestigd',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
    calendarColor: '#10b981',
  },
  traveling: {
    label: 'Onderweg',
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    dot: 'bg-purple-500',
    calendarColor: '#a855f7',
  },
  in_progress: {
    label: 'Bezig',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
    calendarColor: '#f59e0b',
  },
  completed: {
    label: 'Voltooid',
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    dot: 'bg-gray-500',
    calendarColor: '#6b7280',
  },
  cancelled: {
    label: 'Geannuleerd',
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-500',
    calendarColor: '#ef4444',
  },
}

export const taskStatusConfig: Record<TaskStatus, {
  label: string
  bg: string
  text: string
  dot: string
}> = {
  pending: {
    label: 'Open',
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    dot: 'bg-yellow-500',
  },
  in_progress: {
    label: 'Bezig',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    dot: 'bg-blue-500',
  },
  completed: {
    label: 'Voltooid',
    bg: 'bg-green-100',
    text: 'text-green-800',
    dot: 'bg-green-500',
  },
}

export const issueStatusConfig: Record<IssueStatus, {
  label: string
  bg: string
  text: string
  dot: string
}> = {
  open: {
    label: 'Open',
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-500',
  },
  in_progress: {
    label: 'In behandeling',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  resolved: {
    label: 'Opgelost',
    bg: 'bg-green-100',
    text: 'text-green-800',
    dot: 'bg-green-500',
  },
}

// Helper functions
export function getInstallationStatus(status: InstallationStatus) {
  return installationStatusConfig[status]
}

export function getTaskStatus(status: TaskStatus) {
  return taskStatusConfig[status]
}

export function getIssueStatus(status: IssueStatus) {
  return issueStatusConfig[status]
}
