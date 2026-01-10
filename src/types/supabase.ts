// Supabase Database Types
// Generated based on schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Checklist types for installation workflow
export type ChecklistItem = {
  id: string
  label: string
  checked: boolean
}

export type ChecklistData = {
  items: ChecklistItem[]
  completed_at: string | null
}

// Default checklist items for new installations
export const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'confirm_customer', label: 'Klant bereikt en afspraak bevestigd', checked: false },
  { id: 'inspect_location', label: 'Meter locatie geïnspecteerd', checked: false },
  { id: 'adapter_check', label: 'Adapter behoefte bepaald', checked: false },
  { id: 'meter_connected', label: 'Meter succesvol aangesloten', checked: false },
  { id: 'wifi_connected', label: 'Verbinding met WiFi gecontroleerd', checked: false },
  { id: 'data_visible', label: 'Data zichtbaar in HomeWizard app', checked: false },
  { id: 'customer_instructions', label: 'Klant instructies gegeven', checked: false },
  { id: 'photos_taken', label: "Foto's gemaakt", checked: false },
]

export type Database = {
  public: {
    Tables: {
      team_members: {
        Row: {
          id: string
          user_id: string | null
          name: string
          email: string
          role: 'admin' | 'planner' | 'energiebuddy' | 'huiseigenaar'
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          email: string
          role?: 'admin' | 'planner' | 'energiebuddy' | 'huiseigenaar'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          email?: string
          role?: 'admin' | 'planner' | 'energiebuddy' | 'huiseigenaar'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          address: string
          postal_code: string
          city: string
          latitude: number | null
          longitude: number | null
          portal_token: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          address: string
          postal_code: string
          city: string
          latitude?: number | null
          longitude?: number | null
          portal_token?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          postal_code?: string
          city?: string
          latitude?: number | null
          longitude?: number | null
          portal_token?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      smart_meters: {
        Row: {
          id: string
          brand: string
          model: string
          smr_version: string
          needs_adapter: boolean
          reference_image_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          brand: string
          model: string
          smr_version: string
          needs_adapter?: boolean
          reference_image_url?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          brand?: string
          model?: string
          smr_version?: string
          needs_adapter?: boolean
          reference_image_url?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      installations: {
        Row: {
          id: string
          customer_id: string
          scheduled_at: string
          duration_minutes: number
          status: 'scheduled' | 'confirmed' | 'traveling' | 'in_progress' | 'completed' | 'cancelled'
          assigned_to: string | null
          smart_meter_id: string | null
          notes: string | null
          checklist_data: ChecklistData | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          scheduled_at: string
          duration_minutes?: number
          status?: 'scheduled' | 'confirmed' | 'traveling' | 'in_progress' | 'completed' | 'cancelled'
          assigned_to?: string | null
          smart_meter_id?: string | null
          notes?: string | null
          checklist_data?: ChecklistData | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          scheduled_at?: string
          duration_minutes?: number
          status?: 'scheduled' | 'confirmed' | 'traveling' | 'in_progress' | 'completed' | 'cancelled'
          assigned_to?: string | null
          smart_meter_id?: string | null
          notes?: string | null
          checklist_data?: ChecklistData | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          scheduled_at: string
          duration_minutes: number | null
          assigned_to: string | null
          customer_id: string | null
          is_recurring: boolean
          recurrence_rule: string | null
          status: 'pending' | 'in_progress' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          scheduled_at: string
          duration_minutes?: number | null
          assigned_to?: string | null
          customer_id?: string | null
          is_recurring?: boolean
          recurrence_rule?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          scheduled_at?: string
          duration_minutes?: number | null
          assigned_to?: string | null
          customer_id?: string | null
          is_recurring?: boolean
          recurrence_rule?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      intake_forms: {
        Row: {
          id: string
          customer_id: string
          meter_type: string | null
          accessibility: string | null
          location: string | null
          parking_info: string | null
          pets: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          meter_type?: string | null
          accessibility?: string | null
          location?: string | null
          parking_info?: string | null
          pets?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          meter_type?: string | null
          accessibility?: string | null
          location?: string | null
          parking_info?: string | null
          pets?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      customer_photos: {
        Row: {
          id: string
          customer_id: string
          installation_id: string | null
          type: 'pre' | 'post' | 'issue'
          url: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          installation_id?: string | null
          type: 'pre' | 'post' | 'issue'
          url: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          installation_id?: string | null
          type?: 'pre' | 'post' | 'issue'
          url?: string
          uploaded_at?: string
        }
      }
      evaluations: {
        Row: {
          id: string
          installation_id: string
          customer_id: string
          rating_overall: number
          rating_punctuality: number | null
          rating_friendliness: number | null
          rating_quality: number | null
          feedback: string | null
          confirmed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          installation_id: string
          customer_id: string
          rating_overall: number
          rating_punctuality?: number | null
          rating_friendliness?: number | null
          rating_quality?: number | null
          feedback?: string | null
          confirmed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          installation_id?: string
          customer_id?: string
          rating_overall?: number
          rating_punctuality?: number | null
          rating_friendliness?: number | null
          rating_quality?: number | null
          feedback?: string | null
          confirmed_at?: string | null
          created_at?: string
        }
      }
      issues: {
        Row: {
          id: string
          customer_id: string
          installation_id: string | null
          category: 'malfunction' | 'question' | 'complaint'
          description: string
          photo_url: string | null
          status: 'open' | 'in_progress' | 'resolved'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          installation_id?: string | null
          category: 'malfunction' | 'question' | 'complaint'
          description: string
          photo_url?: string | null
          status?: 'open' | 'in_progress' | 'resolved'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          installation_id?: string | null
          category?: 'malfunction' | 'question' | 'complaint'
          description?: string
          photo_url?: string | null
          status?: 'open' | 'in_progress' | 'resolved'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: 'admin' | 'planner' | 'energiebuddy' | 'huiseigenaar'
      }
      is_admin_or_planner: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'admin' | 'planner' | 'energiebuddy' | 'huiseigenaar'
      installation_status: 'scheduled' | 'confirmed' | 'traveling' | 'in_progress' | 'completed' | 'cancelled'
      task_status: 'pending' | 'in_progress' | 'completed'
      issue_category: 'malfunction' | 'question' | 'complaint'
      issue_status: 'open' | 'in_progress' | 'resolved'
      photo_type: 'pre' | 'post' | 'issue'
    }
  }
}

// Convenience types for use in components
export type TeamMember = Database['public']['Tables']['team_members']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type SmartMeter = Database['public']['Tables']['smart_meters']['Row']
export type Installation = Database['public']['Tables']['installations']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type IntakeForm = Database['public']['Tables']['intake_forms']['Row']
export type CustomerPhoto = Database['public']['Tables']['customer_photos']['Row']
export type Evaluation = Database['public']['Tables']['evaluations']['Row']
export type Issue = Database['public']['Tables']['issues']['Row']

// Insert types
export type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type InstallationInsert = Database['public']['Tables']['installations']['Insert']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type IntakeFormInsert = Database['public']['Tables']['intake_forms']['Insert']
export type CustomerPhotoInsert = Database['public']['Tables']['customer_photos']['Insert']
export type EvaluationInsert = Database['public']['Tables']['evaluations']['Insert']
export type IssueInsert = Database['public']['Tables']['issues']['Insert']

// With relations (for joined queries)
export type InstallationWithRelations = Installation & {
  customer: Customer
  assignee: TeamMember | null
  smart_meter: SmartMeter | null
}

export type TaskWithRelations = Task & {
  customer: Customer | null
  assignee: TeamMember | null
}

// ============================================
// Klantportaal 2.0 Types
// ============================================

// Enums
export type PropertyType = 'vrijstaand' | 'twee_onder_een_kap' | 'hoekwoning' | 'tussenwoning' | 'appartement' | 'overig'
export type WallType = 'massief' | 'spouw_leeg' | 'spouw_gedeeltelijk' | 'spouw_vol'
export type GlassType = 'enkel' | 'dubbel' | 'hr' | 'hr_plus' | 'hr_plus_plus' | 'triple'
export type HeatingType = 'cv_ketel' | 'warmtepomp' | 'hybride' | 'stadsverwarming' | 'elektrisch' | 'overig'
export type RoofType = 'plat' | 'schuin' | 'zadeldak' | 'lessenaarsdak'
export type SubsidyStatus = 'eligible' | 'interested' | 'applied' | 'approved' | 'rejected' | 'paid'
export type ActionItemStatus = 'suggested' | 'interested' | 'planned' | 'in_progress' | 'completed' | 'skipped'
export type WorkflowStage = 'lead' | 'contacted' | 'visit_scheduled' | 'visit_completed' | 'interested' | 'intake_received' | 'installation_scheduled' | 'installation_completed' | 'activated' | 'onboarded'
export type VisitOutcome = 'interested' | 'not_home' | 'not_interested' | 'callback_requested' | 'installed'
export type ImprovementPotential = 'geen' | 'minimaal' | 'zeer_laag' | 'laag' | 'gemiddeld' | 'hoog' | 'zeer_hoog'
export type EnergySource = 'manual' | 'jaarafrekening' | 'meterstand' | 'schatting' | 'p1_meter'

// House Profile
export type HouseProfile = {
  id: string
  customer_id: string
  property_type: PropertyType | null
  year_built: number | null
  living_area_m2: number | null
  plot_size_m2: number | null
  floors: number | null
  woz_value: number | null
  woz_year: number | null
  woz_reference_date: string | null
  energy_label: string | null
  energy_label_date: string | null
  energy_index: number | null
  roof_type: RoofType | null
  wall_type: WallType | null
  wall_insulation: boolean | null
  floor_insulation: boolean | null
  roof_insulation: boolean | null
  glass_type: GlassType | null
  heating_type: HeatingType | null
  heating_year: number | null
  solar_panels: boolean | null
  solar_panels_count: number | null
  solar_panels_wp: number | null
  bag_id: string | null
  created_at: string
  updated_at: string
}

export type HouseProfileInsert = Omit<HouseProfile, 'id' | 'created_at' | 'updated_at'>
export type HouseProfileUpdate = Partial<HouseProfileInsert>

// Customer Energy Input
export type CustomerEnergyInput = {
  id: string
  customer_id: string
  source: EnergySource
  year: number
  period_months: number
  gas_m3: number | null
  gas_cost_euro: number | null
  electricity_kwh_total: number | null
  electricity_kwh_high: number | null
  electricity_kwh_low: number | null
  electricity_cost_euro: number | null
  electricity_returned_kwh: number | null
  electricity_returned_euro: number | null
  energy_supplier: string | null
  contract_type: string | null
  verified: boolean
  verified_by: string | null
  verified_at: string | null
  receipt_photo_url: string | null
  created_at: string
  updated_at: string
}

export type CustomerEnergyInputInsert = Omit<CustomerEnergyInput, 'id' | 'created_at' | 'updated_at'>

// Building Period Characteristics
export type BuildingPeriodCharacteristics = {
  id: string
  period_name: string
  year_from: number
  year_to: number | null
  wall_type: WallType | null
  wall_insulation_cm: number | null
  roof_insulation_cm: number | null
  floor_insulation: boolean | null
  floor_type: string | null
  glass_type: GlassType | null
  rc_wall: number | null
  rc_roof: number | null
  rc_floor: number | null
  has_gas_connection: boolean
  typical_heating: HeatingType | null
  improvement_potential: ImprovementPotential | null
  description: string | null
}

// Reference Households
export type ReferenceHousehold = {
  id: string
  property_type: PropertyType | null
  build_period: string | null
  size_category: string | null
  size_m2_min: number | null
  size_m2_max: number | null
  household_size: number | null
  gas_m3_min: number | null
  gas_m3_max: number | null
  gas_m3_avg: number | null
  electricity_kwh_min: number | null
  electricity_kwh_max: number | null
  electricity_kwh_avg: number | null
  electricity_with_solar_kwh: number | null
  solar_return_kwh: number | null
  source: string | null
  year: number | null
  notes: string | null
}

// Subsidy Program
export type SubsidyProgram = {
  id: string
  name: string
  slug: string
  description: string | null
  amount_min: number | null
  amount_max: number | null
  amount_fixed: number | null
  requirements: Record<string, unknown> | null
  eligible_property_types: PropertyType[] | null
  eligible_energy_labels: string[] | null
  valid_from: string | null
  valid_until: string | null
  budget_total: number | null
  budget_remaining: number | null
  info_url: string | null
  application_url: string | null
  active: boolean
  created_at: string
}

// Customer Subsidy
export type CustomerSubsidy = {
  id: string
  customer_id: string
  subsidy_program_id: string
  status: SubsidyStatus
  amount_requested: number | null
  amount_approved: number | null
  amount_paid: number | null
  interest_shown_at: string | null
  applied_at: string | null
  approved_at: string | null
  paid_at: string | null
  application_reference: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type CustomerSubsidyWithProgram = CustomerSubsidy & {
  subsidy_program: SubsidyProgram
}

// Energy Measures
export type EnergyMeasure = {
  id: string
  name: string
  slug: string
  category: string | null
  description: string | null
  cost_indication_min: number | null
  cost_indication_max: number | null
  cost_indication_avg: number | null
  saving_electricity_kwh_year: number | null
  saving_gas_m3_year: number | null
  saving_euro_year: number | null
  payback_years_min: number | null
  payback_years_max: number | null
  co2_reduction_kg_year: number | null
  eligible_subsidies: string[] | null
  requirements: Record<string, unknown> | null
  priority_order: number | null
  active: boolean
  created_at: string
}

// Customer Action Items
export type CustomerActionItem = {
  id: string
  customer_id: string
  measure_id: string
  status: ActionItemStatus
  estimated_cost: number | null
  estimated_saving: number | null
  priority: number | null
  target_date: string | null
  completed_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type CustomerActionItemWithMeasure = CustomerActionItem & {
  measure: EnergyMeasure
}

// Installation Workflow
export type InstallationWorkflow = {
  id: string
  installation_id: string | null
  customer_id: string
  stage: WorkflowStage
  visit_outcome: VisitOutcome | null
  visit_notes: string | null
  interest_level: number | null
  objections: string[] | null
  assigned_buddy_id: string | null
  created_at: string
  updated_at: string
}

export type InstallationWorkflowWithRelations = InstallationWorkflow & {
  customer: Customer
  assigned_buddy: TeamMember | null
}

// Workflow Activity
export type WorkflowActivity = {
  id: string
  workflow_id: string
  activity_type: string
  description: string | null
  outcome: string | null
  performed_by: string | null
  performed_at: string
}

// Customer Roadmap
export type CustomerRoadmap = {
  id: string
  customer_id: string
  template_id: string | null
  steps: RoadmapStep[] | null
  current_step: number
  created_at: string
  updated_at: string
}

export type RoadmapStep = {
  order: number
  measure_id: string
  measure_name: string
  reason: string
  base_cost: number
  subsidies_applied: {
    name: string
    amount: number
  }[]
  final_cost: number
  savings_per_year: number
  status: ActionItemStatus
}

// Neighborhood Stats
export type NeighborhoodStats = {
  id: string
  postal_code_4: string
  avg_electricity_kwh_year: number | null
  avg_gas_m3_year: number | null
  avg_energy_label: string | null
  solar_adoption_percentage: number | null
  heat_pump_adoption_percentage: number | null
  year: number | null
  created_at: string
}

// Achievement
export type Achievement = {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  trigger_condition: Record<string, unknown> | null
  points: number | null
}

// Customer Achievement
export type CustomerAchievement = {
  id: string
  customer_id: string
  achievement_id: string
  earned_at: string
}

export type CustomerAchievementWithDetails = CustomerAchievement & {
  achievement: Achievement
}

// Customer Document
export type CustomerDocument = {
  id: string
  customer_id: string
  document_type: string | null
  title: string | null
  description: string | null
  file_url: string | null
  file_type: string | null
  valid_until: string | null
  uploaded_at: string
}

// House Profile with Customer
export type HouseProfileWithCustomer = HouseProfile & {
  customer: Customer
}
