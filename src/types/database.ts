/** Gebruikersrollen in het systeem */
export type UserRole = 'admin' | 'planner' | 'energiebuddy' | 'huiseigenaar'

/** Installatie status */
export type InstallationStatus =
  | 'scheduled'
  | 'confirmed'
  | 'traveling'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

/** Taak status */
export type TaskStatus = 'pending' | 'in_progress' | 'completed'

/** Issue categorie */
export type IssueCategory = 'malfunction' | 'question' | 'complaint'

/** Issue status */
export type IssueStatus = 'open' | 'in_progress' | 'resolved'

/** Foto type */
export type PhotoType = 'pre' | 'post' | 'issue'

/** Teamlid */
export type TeamMember = {
  id: string
  user_id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  created_at: string
}

/** Klant */
export type Customer = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  postal_code: string
  city: string
  portal_token: string
  notes: string | null
  created_at: string
  // Coordinaten voor kaart
  latitude?: number
  longitude?: number
}

/** Installatie */
export type Installation = {
  id: string
  customer_id: string
  scheduled_at: string
  duration_minutes: number
  status: InstallationStatus
  assigned_to: string
  notes: string | null
  created_at: string
  // Joined data
  customer?: Customer
  assignee?: TeamMember
}

/** Taak */
export type Task = {
  id: string
  title: string
  description: string | null
  scheduled_at: string
  duration_minutes: number | null
  assigned_to: string | null
  customer_id: string | null
  is_recurring: boolean
  recurrence_rule: string | null
  status: TaskStatus
  created_at: string
  // Joined data
  customer?: Customer
  assignee?: TeamMember
}

/** Intake formulier */
export type IntakeForm = {
  id: string
  customer_id: string
  meter_type: string
  accessibility: string
  location: string
  parking_info: string
  pets: string | null
  notes: string | null
  created_at: string
}

/** Evaluatie */
export type Evaluation = {
  id: string
  installation_id: string
  customer_id: string
  rating_overall: number
  rating_punctuality: number
  rating_friendliness: number
  rating_quality: number
  feedback: string | null
  confirmed_at: string | null
  created_at: string
}

/** Klant foto */
export type CustomerPhoto = {
  id: string
  customer_id: string
  installation_id: string | null
  type: PhotoType
  url: string
  uploaded_at: string
}

/** Issue */
export type Issue = {
  id: string
  customer_id: string
  installation_id: string | null
  category: IssueCategory
  description: string
  photo_url: string | null
  status: IssueStatus
  created_at: string
}

/** Slimme meter referentie */
export type SmartMeter = {
  id: string
  brand: string
  model: string
  smr_version: string
  needs_adapter: boolean
  reference_image_url: string | null
  notes: string | null
}

/** Ingelogde gebruiker */
export type AuthUser = {
  id: string
  email: string
  role: UserRole
  name: string
}

/** Product categorie */
export type ProductCategory = 'meter' | 'adapter' | 'cable' | 'accessory' | 'other'

/** Transactie type */
export type TransactionType = 'purchase' | 'usage' | 'return' | 'adjustment'

/** Product */
export type Product = {
  id: string
  name: string
  sku: string
  category: ProductCategory
  description: string | null
  unit_price: number | null
  stock_quantity: number
  min_stock_level: number
  active: boolean
  created_at: string
}

/** Voorraad transactie */
export type InventoryTransaction = {
  id: string
  product_id: string
  type: TransactionType
  quantity: number
  installation_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  // Joined data
  product?: Product
  installation?: Installation
  created_by_user?: TeamMember
}

/** Materiaal gebruikt bij installatie */
export type InstallationMaterial = {
  id: string
  installation_id: string
  product_id: string
  quantity: number
  created_at: string
  // Joined data
  product?: Product
}
