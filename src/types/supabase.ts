// Supabase Database Types
// Generated based on schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      team_members: {
        Row: {
          id: string
          user_id: string | null
          name: string
          email: string
          role: 'admin' | 'planner' | 'monteur' | 'huiseigenaar'
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          email: string
          role?: 'admin' | 'planner' | 'monteur' | 'huiseigenaar'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          email?: string
          role?: 'admin' | 'planner' | 'monteur' | 'huiseigenaar'
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
        Returns: 'admin' | 'planner' | 'monteur' | 'huiseigenaar'
      }
      is_admin_or_planner: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'admin' | 'planner' | 'monteur' | 'huiseigenaar'
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
