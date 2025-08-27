import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          updated_at?: string
        }
      }
      bot_configurations: {
        Row: {
          id: string
          user_id: string
          name: string
          clinic_id: string
          clinic_name: string
          phone_number: string
          operation_hours: string
          microsite_url: string
          address: string
          address_description: string
          state: string
          time_zone: string
          time_zone_offset: string
          booking_link: string
          available_time_slots: string
          time_intervals: string
          wellness_plan_prices: string
          calendar_id: string
          booking_calendar_id: string
          clinic_email: string
          base_id: string
          table_id: string
          booking_workflow: string
          plan_price: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          clinic_id: string
          clinic_name: string
          phone_number: string
          operation_hours: string
          microsite_url: string
          address: string
          address_description: string
          state: string
          time_zone: string
          time_zone_offset: string
          booking_link: string
          available_time_slots: string
          time_intervals: string
          wellness_plan_prices: string
          calendar_id: string
          booking_calendar_id: string
          clinic_email: string
          base_id: string
          table_id: string
          booking_workflow: string
          plan_price: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          clinic_id?: string
          clinic_name?: string
          phone_number?: string
          operation_hours?: string
          microsite_url?: string
          address?: string
          address_description?: string
          state?: string
          time_zone?: string
          time_zone_offset?: string
          booking_link?: string
          available_time_slots?: string
          time_intervals?: string
          wellness_plan_prices?: string
          calendar_id?: string
          booking_calendar_id?: string
          clinic_email?: string
          base_id?: string
          table_id?: string
          booking_workflow?: string
          plan_price?: string
          updated_at?: string
        }
      }
    }
  }
}