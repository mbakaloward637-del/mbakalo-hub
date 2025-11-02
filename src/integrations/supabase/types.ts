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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assistance_records: {
        Row: {
          assistance_type: string
          beneficiary_id: string
          created_at: string | null
          date_provided: string
          description: string
          id: string
          items_provided: string[] | null
          notes: string | null
          value_estimate: number | null
          volunteer_id: string | null
        }
        Insert: {
          assistance_type: string
          beneficiary_id: string
          created_at?: string | null
          date_provided: string
          description: string
          id?: string
          items_provided?: string[] | null
          notes?: string | null
          value_estimate?: number | null
          volunteer_id?: string | null
        }
        Update: {
          assistance_type?: string
          beneficiary_id?: string
          created_at?: string | null
          date_provided?: string
          description?: string
          id?: string
          items_provided?: string[] | null
          notes?: string | null
          value_estimate?: number | null
          volunteer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assistance_records_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiaries: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          location: string
          needs: string[]
          notes: string | null
          phone: string | null
          status: string
          updated_at: string | null
          village: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          full_name: string
          id?: string
          location: string
          needs?: string[]
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string | null
          village?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          full_name?: string
          id?: string
          location?: string
          needs?: string[]
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string | null
          village?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          campaign_type: string
          collected_items: Json | null
          created_at: string | null
          created_by: string | null
          description: string
          end_date: string
          id: string
          raised_amount: number | null
          start_date: string
          status: string
          target_amount: number | null
          target_items: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          campaign_type: string
          collected_items?: Json | null
          created_at?: string | null
          created_by?: string | null
          description: string
          end_date: string
          id?: string
          raised_amount?: number | null
          start_date: string
          status?: string
          target_amount?: number | null
          target_items?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          campaign_type?: string
          collected_items?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          end_date?: string
          id?: string
          raised_amount?: number | null
          start_date?: string
          status?: string
          target_amount?: number | null
          target_items?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      condolences: {
        Row: {
          created_at: string | null
          funeral_id: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          funeral_id: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          funeral_id?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "condolences_funeral_id_fkey"
            columns: ["funeral_id"]
            isOneToOne: false
            referencedRelation: "funeral_notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "condolences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          created_at: string | null
          donor_name: string
          donor_phone: string
          funeral_id: string | null
          id: string
          mpesa_receipt_number: string | null
          project_id: string | null
          status: string
          transaction_date: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          donor_name: string
          donor_phone: string
          funeral_id?: string | null
          id?: string
          mpesa_receipt_number?: string | null
          project_id?: string | null
          status?: string
          transaction_date?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          donor_name?: string
          donor_phone?: string
          funeral_id?: string | null
          id?: string
          mpesa_receipt_number?: string | null
          project_id?: string | null
          status?: string
          transaction_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_funeral_id_fkey"
            columns: ["funeral_id"]
            isOneToOne: false
            referencedRelation: "funeral_notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      donations_inventory: {
        Row: {
          category: string
          created_at: string | null
          date_received: string
          donor_contact: string | null
          donor_name: string | null
          expiry_date: string | null
          id: string
          item_name: string
          notes: string | null
          quantity: number
          status: string
          storage_location: string | null
          unit: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          date_received: string
          donor_contact?: string | null
          donor_name?: string | null
          expiry_date?: string | null
          id?: string
          item_name: string
          notes?: string | null
          quantity?: number
          status?: string
          storage_location?: string | null
          unit?: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          date_received?: string
          donor_contact?: string | null
          donor_name?: string | null
          expiry_date?: string | null
          id?: string
          item_name?: string
          notes?: string | null
          quantity?: number
          status?: string
          storage_location?: string | null
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          attendees: number | null
          category: string
          created_at: string | null
          description: string
          event_date: string
          event_time: string
          id: string
          image_url: string | null
          location: string
          priority: string | null
          title: string
        }
        Insert: {
          attendees?: number | null
          category: string
          created_at?: string | null
          description: string
          event_date: string
          event_time: string
          id?: string
          image_url?: string | null
          location: string
          priority?: string | null
          title: string
        }
        Update: {
          attendees?: number | null
          category?: string
          created_at?: string | null
          description?: string
          event_date?: string
          event_time?: string
          id?: string
          image_url?: string | null
          location?: string
          priority?: string | null
          title?: string
        }
        Relationships: []
      }
      funeral_notices: {
        Row: {
          age: number | null
          burial_date: string
          burial_time: string
          created_at: string | null
          deceased_name: string
          family_name: string
          fundraising_enabled: boolean | null
          fundraising_raised: number | null
          fundraising_target: number | null
          id: string
          location: string
          passed_date: string
        }
        Insert: {
          age?: number | null
          burial_date: string
          burial_time: string
          created_at?: string | null
          deceased_name: string
          family_name: string
          fundraising_enabled?: boolean | null
          fundraising_raised?: number | null
          fundraising_target?: number | null
          id?: string
          location: string
          passed_date: string
        }
        Update: {
          age?: number | null
          burial_date?: string
          burial_time?: string
          created_at?: string | null
          deceased_name?: string
          family_name?: string
          fundraising_enabled?: boolean | null
          fundraising_raised?: number | null
          fundraising_target?: number | null
          id?: string
          location?: string
          passed_date?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          title?: string
        }
        Relationships: []
      }
      leaders: {
        Row: {
          created_at: string | null
          email: string
          hours: string
          id: string
          name: string
          office: string
          phone: string
          position: string
          priority: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          hours: string
          id?: string
          name: string
          office: string
          phone: string
          position: string
          priority?: string | null
          role: string
        }
        Update: {
          created_at?: string | null
          email?: string
          hours?: string
          id?: string
          name?: string
          office?: string
          phone?: string
          position?: string
          priority?: string | null
          role?: string
        }
        Relationships: []
      }
      moderation_queue: {
        Row: {
          content_id: string
          content_text: string
          created_at: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          type: string
        }
        Insert: {
          content_id: string
          content_text: string
          created_at?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          type: string
        }
        Update: {
          content_id?: string
          content_text?: string
          created_at?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          type?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          category: string
          content: string | null
          created_at: string | null
          excerpt: string
          id: string
          image_url: string | null
          priority: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string | null
          excerpt: string
          id?: string
          image_url?: string | null
          priority?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string | null
          excerpt?: string
          id?: string
          image_url?: string | null
          priority?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          village: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          village?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          village?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          image_url: string | null
          raised_amount: number | null
          status: string | null
          target_amount: number
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          image_url?: string | null
          raised_amount?: number | null
          status?: string | null
          target_amount: number
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          raised_amount?: number | null
          status?: string | null
          target_amount?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteers: {
        Row: {
          availability: string
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          joined_date: string
          location: string
          notes: string | null
          phone: string
          skills: string[] | null
          status: string
          total_tasks_completed: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          availability?: string
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          joined_date?: string
          location: string
          notes?: string | null
          phone: string
          skills?: string[] | null
          status?: string
          total_tasks_completed?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          availability?: string
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          joined_date?: string
          location?: string
          notes?: string | null
          phone?: string
          skills?: string[] | null
          status?: string
          total_tasks_completed?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      youth_chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      youth_opportunities: {
        Row: {
          company: string
          created_at: string | null
          duration: string
          id: string
          stipend: string
          title: string
          type: string
        }
        Insert: {
          company: string
          created_at?: string | null
          duration: string
          id?: string
          stipend: string
          title: string
          type: string
        }
        Update: {
          company?: string
          created_at?: string | null
          duration?: string
          id?: string
          stipend?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      youth_profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone_number: string
          profile_pic_url: string | null
          updated_at: string
          user_id: string
          village: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          phone_number: string
          profile_pic_url?: string | null
          updated_at?: string
          user_id: string
          village: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone_number?: string
          profile_pic_url?: string | null
          updated_at?: string
          user_id?: string
          village?: string
        }
        Relationships: []
      }
      youth_registrations: {
        Row: {
          created_at: string | null
          id: string
          opportunity_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          opportunity_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          opportunity_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youth_registrations_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "youth_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
