'use client'

import { useState, useEffect, useCallback } from 'react'
import * as data from '@/lib/data'
import type {
  Customer,
  Installation,
  Task,
  TeamMember,
  SmartMeter,
} from '@/types/supabase'

// Generic hook for data fetching
function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
) {
  const [result, setResult] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetcher()
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, deps)

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data: result, isLoading, error, refetch }
}

// ============================================
// Team Members Hooks
// ============================================
export function useTeamMembers() {
  return useQuery(() => data.getTeamMembers())
}

export function useEnergieBuddies() {
  return useQuery(() => data.getEnergieBuddies())
}

// ============================================
// Customers Hooks
// ============================================
export function useCustomers() {
  return useQuery(() => data.getCustomers())
}

export function useCustomer(id: string) {
  return useQuery(() => data.getCustomerById(id), [id])
}

export function useCustomerSearch(query: string) {
  return useQuery(
    () => (query.length >= 2 ? data.searchCustomers(query) : Promise.resolve([])),
    [query]
  )
}

// ============================================
// Installations Hooks
// ============================================
export function useInstallations() {
  return useQuery(() => data.getInstallations())
}

export function useTodayInstallations() {
  return useQuery(() => data.getTodayInstallations())
}

export function useUpcomingInstallations(limit = 10) {
  return useQuery(() => data.getUpcomingInstallations(limit), [limit])
}

export function useInstallationsByDate(date: string) {
  return useQuery(() => data.getInstallationsByDate(date), [date])
}

export function useInstallationsByDateRange(startDate: string, endDate: string) {
  return useQuery(
    () => data.getInstallationsByDateRange(startDate, endDate),
    [startDate, endDate]
  )
}

// ============================================
// Tasks Hooks
// ============================================
export function useTasks() {
  return useQuery(() => data.getTasks())
}

export function useTodayTasks() {
  return useQuery(() => data.getTodayTasks())
}

export function usePendingTasks() {
  return useQuery(() => data.getPendingTasks())
}

// ============================================
// Smart Meters Hooks
// ============================================
export function useSmartMeters() {
  return useQuery(() => data.getSmartMeters())
}

// ============================================
// Dashboard Hooks
// ============================================
export function useDashboardStats() {
  return useQuery(() => data.getDashboardStats())
}

// ============================================
// Combined types for components
// ============================================
export type InstallationWithRelations = Installation & {
  customer: Customer
  assignee: TeamMember | null
  smart_meter: SmartMeter | null
}

export type TaskWithRelations = Task & {
  customer: Customer | null
  assignee: TeamMember | null
}
