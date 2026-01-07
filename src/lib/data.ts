import { getSupabaseClient } from './supabase'
import type {
  Customer,
  Installation,
  Task,
  TeamMember,
  SmartMeter,
  CustomerInsert,
  InstallationInsert,
  TaskInsert,
} from '@/types/supabase'

const supabase = getSupabaseClient()

// ============================================
// Team Members
// ============================================
export async function getTeamMembers() {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('name')

  if (error) throw error
  return data as TeamMember[]
}

export async function getTeamMemberById(id: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as TeamMember
}

export async function getMonteurs() {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('role', 'monteur')
    .eq('active', true)
    .order('name')

  if (error) throw error
  return data as TeamMember[]
}

// ============================================
// Customers
// ============================================
export async function getCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name')

  if (error) throw error
  return data as Customer[]
}

export async function getCustomerById(id: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Customer
}

export async function searchCustomers(query: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(`name.ilike.%${query}%,email.ilike.%${query}%,city.ilike.%${query}%`)
    .order('name')
    .limit(20)

  if (error) throw error
  return data as Customer[]
}

// ============================================
// Installations
// ============================================
export async function getInstallations() {
  const { data, error } = await supabase
    .from('installations')
    .select(`
      *,
      customer:customers(*),
      assignee:team_members(*),
      smart_meter:smart_meters(*)
    `)
    .order('scheduled_at', { ascending: true })

  if (error) throw error
  return data as (Installation & {
    customer: Customer
    assignee: TeamMember | null
    smart_meter: SmartMeter | null
  })[]
}

export async function getInstallationsByDate(date: string) {
  const startOfDay = `${date}T00:00:00`
  const endOfDay = `${date}T23:59:59`

  const { data, error } = await supabase
    .from('installations')
    .select(`
      *,
      customer:customers(*),
      assignee:team_members(*),
      smart_meter:smart_meters(*)
    `)
    .gte('scheduled_at', startOfDay)
    .lte('scheduled_at', endOfDay)
    .order('scheduled_at', { ascending: true })

  if (error) throw error
  return data as (Installation & {
    customer: Customer
    assignee: TeamMember | null
    smart_meter: SmartMeter | null
  })[]
}

export async function getInstallationsByDateRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('installations')
    .select(`
      *,
      customer:customers(*),
      assignee:team_members(*),
      smart_meter:smart_meters(*)
    `)
    .gte('scheduled_at', `${startDate}T00:00:00`)
    .lte('scheduled_at', `${endDate}T23:59:59`)
    .order('scheduled_at', { ascending: true })

  if (error) throw error
  return data as (Installation & {
    customer: Customer
    assignee: TeamMember | null
    smart_meter: SmartMeter | null
  })[]
}

export async function getInstallationsByAssignee(assigneeId: string) {
  const { data, error } = await supabase
    .from('installations')
    .select(`
      *,
      customer:customers(*),
      assignee:team_members(*),
      smart_meter:smart_meters(*)
    `)
    .eq('assigned_to', assigneeId)
    .order('scheduled_at', { ascending: true })

  if (error) throw error
  return data as (Installation & {
    customer: Customer
    assignee: TeamMember | null
    smart_meter: SmartMeter | null
  })[]
}

export async function getTodayInstallations() {
  const today = new Date().toISOString().split('T')[0]
  return getInstallationsByDate(today)
}

export async function getUpcomingInstallations(limit = 10) {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('installations')
    .select(`
      *,
      customer:customers(*),
      assignee:team_members(*),
      smart_meter:smart_meters(*)
    `)
    .gte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data as (Installation & {
    customer: Customer
    assignee: TeamMember | null
    smart_meter: SmartMeter | null
  })[]
}

// ============================================
// Tasks
// ============================================
export async function getTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      customer:customers(*),
      assignee:team_members(*)
    `)
    .order('scheduled_at', { ascending: true })

  if (error) throw error
  return data as (Task & {
    customer: Customer | null
    assignee: TeamMember | null
  })[]
}

export async function getTasksByDate(date: string) {
  const startOfDay = `${date}T00:00:00`
  const endOfDay = `${date}T23:59:59`

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      customer:customers(*),
      assignee:team_members(*)
    `)
    .gte('scheduled_at', startOfDay)
    .lte('scheduled_at', endOfDay)
    .order('scheduled_at', { ascending: true })

  if (error) throw error
  return data as (Task & {
    customer: Customer | null
    assignee: TeamMember | null
  })[]
}

export async function getTodayTasks() {
  const today = new Date().toISOString().split('T')[0]
  return getTasksByDate(today)
}

export async function getPendingTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      customer:customers(*),
      assignee:team_members(*)
    `)
    .eq('status', 'pending')
    .order('scheduled_at', { ascending: true })

  if (error) throw error
  return data as (Task & {
    customer: Customer | null
    assignee: TeamMember | null
  })[]
}

// ============================================
// Smart Meters
// ============================================
export async function getSmartMeters() {
  const { data, error } = await supabase
    .from('smart_meters')
    .select('*')
    .order('brand')

  if (error) throw error
  return data as SmartMeter[]
}

// ============================================
// CRUD Operations
// ============================================

// Customers CRUD
export async function createCustomer(customer: CustomerInsert) {
  // @ts-ignore - Supabase type inference issue
  const { data, error } = await supabase.from('customers').insert(customer).select().single()

  if (error) throw error
  return data as Customer
}

export async function updateCustomer(id: string, updates: Partial<Customer>) {
  // @ts-ignore - Supabase type inference issue
  const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select().single()

  if (error) throw error
  return data as Customer
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Installations CRUD
export async function createInstallation(installation: InstallationInsert) {
  // @ts-ignore - Supabase type inference issue
  const { data, error } = await supabase.from('installations').insert(installation).select().single()

  if (error) throw error
  return data as Installation
}

export async function updateInstallation(id: string, updates: Partial<Installation>) {
  // @ts-ignore - Supabase type inference issue
  const { data, error } = await supabase.from('installations').update(updates).eq('id', id).select().single()

  if (error) throw error
  return data as Installation
}

export async function deleteInstallation(id: string) {
  const { error } = await supabase
    .from('installations')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Tasks CRUD
export async function createTask(task: TaskInsert) {
  // @ts-ignore - Supabase type inference issue
  const { data, error } = await supabase.from('tasks').insert(task).select().single()

  if (error) throw error
  return data as Task
}

export async function updateTask(id: string, updates: Partial<Task>) {
  // @ts-ignore - Supabase type inference issue
  const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single()

  if (error) throw error
  return data as Task
}

export async function deleteTask(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Team Members CRUD
export async function updateTeamMember(id: string, updates: Partial<TeamMember>) {
  // @ts-ignore - Supabase type inference issue
  const { data, error } = await supabase.from('team_members').update(updates).eq('id', id).select().single()

  if (error) throw error
  return data as TeamMember
}

// ============================================
// Dashboard Stats
// ============================================
export async function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0]
  const startOfDay = `${today}T00:00:00`
  const endOfDay = `${today}T23:59:59`

  const [
    { count: totalCustomers },
    { count: totalInstallations },
    { count: todayInstallations },
    { count: pendingTasks },
    { count: activeMonteurs },
  ] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('installations').select('*', { count: 'exact', head: true }),
    supabase
      .from('installations')
      .select('*', { count: 'exact', head: true })
      .gte('scheduled_at', startOfDay)
      .lte('scheduled_at', endOfDay),
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'monteur')
      .eq('active', true),
  ])

  return {
    totalCustomers: totalCustomers || 0,
    totalInstallations: totalInstallations || 0,
    todayInstallations: todayInstallations || 0,
    pendingTasks: pendingTasks || 0,
    activeMonteurs: activeMonteurs || 0,
  }
}
