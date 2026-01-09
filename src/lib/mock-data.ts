import type {
  AuthUser,
  Customer,
  Installation,
  Task,
  TeamMember,
  SmartMeter,
} from '@/types/database'

/** Mock gebruikers voor testen */
export const mockUsers: Record<string, AuthUser> = {
  admin: {
    id: 'user-1',
    email: 'admin@p1meter.nl',
    role: 'admin',
    name: 'Admin User',
  },
  planner: {
    id: 'user-2',
    email: 'planner@p1meter.nl',
    role: 'planner',
    name: 'Piet Plansen',
  },
  energiebuddy: {
    id: 'user-3',
    email: 'jan@p1meter.nl',
    role: 'energiebuddy',
    name: 'Jan de Vries',
  },
}

/** Actieve mock user (aanpassen voor testen) */
export const currentMockUser: AuthUser = mockUsers.admin

/** Mock teamleden */
export const mockTeamMembers: TeamMember[] = [
  {
    id: 'tm-1',
    user_id: 'user-1',
    name: 'Admin User',
    email: 'admin@p1meter.nl',
    role: 'admin',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tm-2',
    user_id: 'user-2',
    name: 'Piet Plansen',
    email: 'planner@p1meter.nl',
    role: 'planner',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tm-3',
    user_id: 'user-3',
    name: 'Jan de Vries',
    email: 'jan@p1meter.nl',
    role: 'energiebuddy',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tm-4',
    user_id: 'user-4',
    name: 'Kees Kansen',
    email: 'kees@p1meter.nl',
    role: 'energiebuddy',
    active: true,
    created_at: '2024-01-15T00:00:00Z',
  },
]

/** Mock klanten */
export const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Familie de Vries',
    email: 'devries@email.nl',
    phone: '06-12345678',
    address: 'Hoofdstraat 123',
    postal_code: '1234 AB',
    city: 'Amsterdam',
    portal_token: 'token-abc123',
    notes: 'Hond aanwezig, bellen voor aankomst',
    created_at: '2024-06-01T00:00:00Z',
    latitude: 52.3676,
    longitude: 4.9041,
  },
  {
    id: 'cust-2',
    name: 'Jan Bakker',
    email: 'jbakker@email.nl',
    phone: '06-87654321',
    address: 'Kerkweg 45',
    postal_code: '5678 CD',
    city: 'Rotterdam',
    portal_token: 'token-def456',
    notes: null,
    created_at: '2024-06-15T00:00:00Z',
    latitude: 51.9225,
    longitude: 4.4792,
  },
  {
    id: 'cust-3',
    name: 'Maria Jansen',
    email: 'mjansen@email.nl',
    phone: '06-11223344',
    address: 'Dorpsplein 7',
    postal_code: '9012 EF',
    city: 'Utrecht',
    portal_token: 'token-ghi789',
    notes: 'Meterkast in garage',
    created_at: '2024-07-01T00:00:00Z',
    latitude: 52.0907,
    longitude: 5.1214,
  },
  {
    id: 'cust-4',
    name: 'Peter van den Berg',
    email: 'pvdberg@email.nl',
    phone: '06-55667788',
    address: 'Stationsweg 89',
    postal_code: '2511 BC',
    city: 'Den Haag',
    portal_token: 'token-jkl012',
    notes: null,
    created_at: '2024-07-15T00:00:00Z',
    latitude: 52.0705,
    longitude: 4.3007,
  },
  {
    id: 'cust-5',
    name: 'Lisa Vermeer',
    email: 'lvermeer@email.nl',
    phone: '06-99887766',
    address: 'Marktplein 12',
    postal_code: '5611 EC',
    city: 'Eindhoven',
    portal_token: 'token-mno345',
    notes: 'Meterkast moeilijk bereikbaar',
    created_at: '2024-08-01T00:00:00Z',
    latitude: 51.4416,
    longitude: 5.4697,
  },
]

/** Mock installaties */
export const mockInstallations: Installation[] = [
  {
    id: 'inst-1',
    customer_id: 'cust-1',
    scheduled_at: '2026-01-08T09:00:00Z',
    duration_minutes: 60,
    status: 'scheduled',
    assigned_to: 'tm-3',
    notes: 'Eerste afspraak',
    created_at: '2024-12-01T00:00:00Z',
  },
  {
    id: 'inst-2',
    customer_id: 'cust-2',
    scheduled_at: '2026-01-08T11:00:00Z',
    duration_minutes: 45,
    status: 'confirmed',
    assigned_to: 'tm-3',
    notes: null,
    created_at: '2024-12-05T00:00:00Z',
  },
  {
    id: 'inst-3',
    customer_id: 'cust-3',
    scheduled_at: '2026-01-09T14:00:00Z',
    duration_minutes: 60,
    status: 'scheduled',
    assigned_to: 'tm-4',
    notes: 'Mogelijk adapter nodig',
    created_at: '2024-12-10T00:00:00Z',
  },
  {
    id: 'inst-4',
    customer_id: 'cust-4',
    scheduled_at: '2026-01-10T10:00:00Z',
    duration_minutes: 45,
    status: 'scheduled',
    assigned_to: 'tm-3',
    notes: null,
    created_at: '2024-12-15T00:00:00Z',
  },
  {
    id: 'inst-5',
    customer_id: 'cust-5',
    scheduled_at: '2025-12-20T14:00:00Z',
    duration_minutes: 60,
    status: 'completed',
    assigned_to: 'tm-4',
    notes: 'Adapter nodig geweest',
    created_at: '2024-11-01T00:00:00Z',
  },
]

/** Mock taken */
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Teamoverleg',
    description: 'Wekelijks teamoverleg',
    scheduled_at: '2026-01-10T09:00:00Z',
    duration_minutes: 60,
    assigned_to: null,
    customer_id: null,
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=FR',
    status: 'pending',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'task-2',
    title: 'Voorraad controleren',
    description: 'USB-C adapters en P1 meters tellen',
    scheduled_at: '2026-01-08T16:00:00Z',
    duration_minutes: 30,
    assigned_to: 'tm-2',
    customer_id: null,
    is_recurring: false,
    recurrence_rule: null,
    status: 'pending',
    created_at: '2024-12-20T00:00:00Z',
  },
]

/** Mock slimme meters referentie */
export const mockSmartMeters: SmartMeter[] = [
  {
    id: 'meter-1',
    brand: 'Landis+Gyr',
    model: 'E360',
    smr_version: '5.0',
    needs_adapter: false,
    reference_image_url: null,
    notes: null,
  },
  {
    id: 'meter-2',
    brand: 'Landis+Gyr',
    model: 'E350',
    smr_version: '5.0',
    needs_adapter: false,
    reference_image_url: null,
    notes: 'Volledig compatibel bij SMR 5.0',
  },
  {
    id: 'meter-3',
    brand: 'Kaifa',
    model: 'MA304',
    smr_version: '5.0',
    needs_adapter: false,
    reference_image_url: null,
    notes: null,
  },
  {
    id: 'meter-4',
    brand: 'Iskra',
    model: 'ME382',
    smr_version: '4.2',
    needs_adapter: true,
    reference_image_url: null,
    notes: 'Geen fase-informatie beschikbaar',
  },
  {
    id: 'meter-5',
    brand: 'Sagemcom',
    model: 'T210-D',
    smr_version: '5.0',
    needs_adapter: false,
    reference_image_url: null,
    notes: null,
  },
  {
    id: 'meter-6',
    brand: 'Kamstrup',
    model: '382JxC',
    smr_version: '4.0',
    needs_adapter: true,
    reference_image_url: null,
    notes: 'Geen fase-informatie beschikbaar',
  },
]

/** Helper: haal installaties op met joined data */
export function getInstallationsWithDetails(): Installation[] {
  return mockInstallations.map((inst) => ({
    ...inst,
    customer: mockCustomers.find((c) => c.id === inst.customer_id),
    assignee: mockTeamMembers.find((t) => t.id === inst.assigned_to),
  }))
}

/** Helper: haal taken op met joined data */
export function getTasksWithDetails(): Task[] {
  return mockTasks.map((task) => ({
    ...task,
    customer: task.customer_id
      ? mockCustomers.find((c) => c.id === task.customer_id)
      : undefined,
    assignee: task.assigned_to
      ? mockTeamMembers.find((t) => t.id === task.assigned_to)
      : undefined,
  }))
}
