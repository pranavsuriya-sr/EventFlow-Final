export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          name: string
          date: string
          time: string
          description: string
          capacity: number
          tag: 'Tech' | 'Non-Tech' | 'Club Activities' | 'External Talk'
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          date: string
          time: string
          description: string
          capacity: number
          tag: 'Tech' | 'Non-Tech' | 'Club Activities' | 'External Talk'
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          date?: string
          time?: string
          description?: string
          capacity?: number
          tag?: 'Tech' | 'Non-Tech' | 'Club Activities' | 'External Talk'
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      participants: {
        Row: {
          id: string
          event_id: string
          ticket_number: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          ticket_number: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          ticket_number?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      event_tag: 'Tech' | 'Non-Tech' | 'Club Activities' | 'External Talk'
    }
  }
}