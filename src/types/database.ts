// Generated from Supabase: npx supabase gen types typescript --project-id <id> > src/types/database.ts
// Re-run after any schema changes.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          family_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      families: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["families"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["families"]["Insert"]>;
      };
      letters: {
        Row: {
          id: string;
          author_id: string;
          family_id: string;
          title: string;
          body: string | null;
          media_url: string | null;
          media_type: "text" | "audio" | "video" | null;
          deliver_at: string | null;
          delivered_at: string | null;
          recipient_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["letters"]["Row"], "created_at" | "updated_at" | "delivered_at">;
        Update: Partial<Database["public"]["Tables"]["letters"]["Insert"]>;
      };
      documents: {
        Row: {
          id: string;
          owner_id: string;
          family_id: string;
          title: string;
          category: "will" | "dnr" | "funeral_plan" | "financial" | "other";
          file_url: string;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["documents"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
