export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      pix_orders: {
        Row: {
          amount: number
          copy_paste: string | null
          created_at: string
          customer_name: string
          document: string
          e2e: string | null
          error: string | null
          id: string
          link_sent_at: string | null
          paid_at: string | null
          phone: string
          qr_img: string | null
          status: string
          updated_at: string
          xpag_transaction_id: string | null
        }
        Insert: {
          amount: number
          copy_paste?: string | null
          created_at?: string
          customer_name: string
          document: string
          e2e?: string | null
          error?: string | null
          id?: string
          link_sent_at?: string | null
          paid_at?: string | null
          phone: string
          qr_img?: string | null
          status?: string
          updated_at?: string
          xpag_transaction_id?: string | null
        }
        Update: {
          amount?: number
          copy_paste?: string | null
          created_at?: string
          customer_name?: string
          document?: string
          e2e?: string | null
          error?: string | null
          id?: string
          link_sent_at?: string | null
          paid_at?: string | null
          phone?: string
          qr_img?: string | null
          status?: string
          updated_at?: string
          xpag_transaction_id?: string | null
        }
        Relationships: []
      }
      wa_conversations: {
        Row: {
          current_order_id: string | null
          customer_name: string | null
          document: string | null
          phone: string
          state: string
          updated_at: string
        }
        Insert: {
          current_order_id?: string | null
          customer_name?: string | null
          document?: string | null
          phone: string
          state?: string
          updated_at?: string
        }
        Update: {
          current_order_id?: string | null
          customer_name?: string | null
          document?: string | null
          phone?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      wa_inbound_messages: {
        Row: {
          body: string | null
          created_at: string
          media_id: string | null
          message_type: string
          phone: string
          provider_timestamp: string | null
          reply_error: string | null
          reply_status: string
          wa_message_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          media_id?: string | null
          message_type: string
          phone: string
          provider_timestamp?: string | null
          reply_error?: string | null
          reply_status?: string
          wa_message_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          media_id?: string | null
          message_type?: string
          phone?: string
          provider_timestamp?: string | null
          reply_error?: string | null
          reply_status?: string
          wa_message_id?: string
        }
        Relationships: []
      }
      wa_message_statuses: {
        Row: {
          errors: Json | null
          provider_timestamp: string | null
          received_at: string
          recipient_id: string | null
          status: string
          wa_message_id: string
        }
        Insert: {
          errors?: Json | null
          provider_timestamp?: string | null
          received_at?: string
          recipient_id?: string | null
          status: string
          wa_message_id: string
        }
        Update: {
          errors?: Json | null
          provider_timestamp?: string | null
          received_at?: string
          recipient_id?: string | null
          status?: string
          wa_message_id?: string
        }
        Relationships: []
      }
      wa_outbound_messages: {
        Row: {
          created_at: string
          delivered_at: string | null
          error: string | null
          failed_at: string | null
          id: string
          kind: string
          phone: string
          read_at: string | null
          reply_to: string | null
          sent_at: string | null
          status: string
          wa_message_id: string | null
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          error?: string | null
          failed_at?: string | null
          id?: string
          kind: string
          phone: string
          read_at?: string | null
          reply_to?: string | null
          sent_at?: string | null
          status?: string
          wa_message_id?: string | null
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          error?: string | null
          failed_at?: string | null
          id?: string
          kind?: string
          phone?: string
          read_at?: string | null
          reply_to?: string | null
          sent_at?: string | null
          status?: string
          wa_message_id?: string | null
        }
        Relationships: []
      }
      whatsapp_webhook_events: {
        Row: {
          attempts: number
          delivery_id: string
          event: string
          id: string
          next_attempt_at: string
          payload: Json
          processed_at: string | null
          processing_error: string | null
          received_at: string
        }
        Insert: {
          attempts?: number
          delivery_id: string
          event: string
          id?: string
          next_attempt_at?: string
          payload: Json
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string
        }
        Update: {
          attempts?: number
          delivery_id?: string
          event?: string
          id?: string
          next_attempt_at?: string
          payload?: Json
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string
        }
        Relationships: []
      }
      xpag_webhook_events: {
        Row: {
          id: string
          payload: Json
          processed_at: string | null
          processing_error: string | null
          received_at: string
        }
        Insert: {
          id?: string
          payload: Json
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string
        }
        Update: {
          id?: string
          payload?: Json
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      wa_apply_statuses: {
        Args: { _wa_message_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
