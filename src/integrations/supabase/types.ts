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
      bet_placements: {
        Row: {
          amount: number
          bet_id: string
          created_at: string
          id: string
          is_paid: boolean | null
          option: string
          user_id: string
        }
        Insert: {
          amount: number
          bet_id: string
          created_at?: string
          id?: string
          is_paid?: boolean | null
          option: string
          user_id: string
        }
        Update: {
          amount?: number
          bet_id?: string
          created_at?: string
          id?: string
          is_paid?: boolean | null
          option?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bet_placements_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "bets"
            referencedColumns: ["id"]
          },
        ]
      }
      bets: {
        Row: {
          created_at: string
          created_by: string
          currency: string
          end_time: string
          event_name: string
          id: string
          is_hidden: boolean
          is_resolved: boolean
          max_bet_size: number | null
          option_a: string
          option_b: string
          pool_a: number
          pool_b: number
          stake: string | null
          type: Database["public"]["Enums"]["bet_type"]
          updated_at: string
          winner: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          currency?: string
          end_time: string
          event_name: string
          id?: string
          is_hidden?: boolean
          is_resolved?: boolean
          max_bet_size?: number | null
          option_a: string
          option_b: string
          pool_a?: number
          pool_b?: number
          stake?: string | null
          type?: Database["public"]["Enums"]["bet_type"]
          updated_at?: string
          winner?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          currency?: string
          end_time?: string
          event_name?: string
          id?: string
          is_hidden?: boolean
          is_resolved?: boolean
          max_bet_size?: number | null
          option_a?: string
          option_b?: string
          pool_a?: number
          pool_b?: number
          stake?: string | null
          type?: Database["public"]["Enums"]["bet_type"]
          updated_at?: string
          winner?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      money_owed: {
        Row: {
          bet_amount: number | null
          debtor_id: string | null
          debtor_username: string | null
          event_name: string | null
          profit: number | null
          winner_id: string | null
          winner_username: string | null
          winning_option: string | null
          winnings: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_bet_winnings: {
        Args: {
          bet_placement_id: string
        }
        Returns: number
      }
      has_role: {
        Args: {
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      place_bet: {
        Args: {
          p_bet_id: string
          p_user_id: string
          p_option: string
          p_amount: number
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      bet_type: "wager" | "dare"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
