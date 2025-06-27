export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          created_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_by?: string
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          description: string
          amount: number
          group_id: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          description: string
          amount: number
          group_id: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          description?: string
          amount?: number
          group_id?: string
          created_by?: string
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
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row'] 