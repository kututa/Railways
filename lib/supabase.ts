import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          role: "user" | "admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          role?: "user" | "admin"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          role?: "user" | "admin"
          created_at?: string
          updated_at?: string
        }
      }
      stations: {
        Row: {
          id: string
          name: string
          code: string
          city: string
          created_at: string
        }
      }
      routes: {
        Row: {
          id: string
          name: string
          origin_station_id: string
          destination_station_id: string
          distance_km: number
          duration_minutes: number
          created_at: string
        }
      }
      trains: {
        Row: {
          id: string
          name: string
          number: string
          route_id: string
          departure_time: string
          arrival_time: string
          is_active: boolean
          created_at: string
        }
      }
      train_classes: {
        Row: {
          id: string
          train_id: string
          class_type: "economy" | "first_class" | "business"
          total_seats: number
          price_per_km: number
          created_at: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          train_id: string
          passenger_id: string
          seat_id: string
          travel_date: string
          class_type: "economy" | "first_class" | "business"
          total_amount: number
          booking_reference: string
          status: "pending" | "confirmed" | "cancelled"
          created_at: string
          updated_at: string
        }
      }
      passengers: {
        Row: {
          id: string
          user_id: string
          full_name: string
          id_number: string
          phone: string | null
          email: string | null
          created_at: string
        }
      }
      seats: {
        Row: {
          id: string
          train_class_id: string
          seat_number: string
          is_window: boolean
          created_at: string
        }
      }
    }
  }
}
