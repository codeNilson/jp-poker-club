import type { Database } from "@/types/database"

type EventConfirmationsTable = {
  Row: {
    id: string
    event_id: string
    user_id: string
    created_at: string
  }
  Insert: {
    id?: string
    event_id: string
    user_id: string
    created_at?: string
  }
  Update: {
    id?: string
    event_id?: string
    user_id?: string
    created_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "event_confirmations_event_id_fkey"
      columns: ["event_id"]
      isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "event_confirmations_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },
  ]
}

export type DatabaseWithEventConfirmations = {
  graphql_public: Database["graphql_public"]
  public: {
    Tables: Database["public"]["Tables"] & {
      event_confirmations: EventConfirmationsTable
    }
    Views: Database["public"]["Views"]
    Functions: Database["public"]["Functions"]
    Enums: Database["public"]["Enums"]
    CompositeTypes: Database["public"]["CompositeTypes"]
  }
}
