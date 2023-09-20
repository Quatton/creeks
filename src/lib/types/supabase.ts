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
      handle: {
        Row: {
          created_at: string
          handle: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          handle?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          handle?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "handle_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      shared_notes: {
        Row: {
          author_id: string
          content: string
          createdAt: string
          id: string
          local_id: string
          mermaid: string
          title: string
          updatedAt: string
        }
        Insert: {
          author_id: string
          content?: string
          createdAt?: string
          id?: string
          local_id?: string
          mermaid?: string
          title?: string
          updatedAt?: string
        }
        Update: {
          author_id?: string
          content?: string
          createdAt?: string
          id?: string
          local_id?: string
          mermaid?: string
          title?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_notes_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
