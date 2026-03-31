import { createClient } from "@supabase/supabase-js";
import type { Package } from "@/lib/types";

// Row shape in Postgres
export interface PackageRow {
  id: string;
  ecosystem: string;
  name: string;
  summary: string;
  tags: string[];
  difficulty: number;
  weekly_downloads: number;
  version: string;
  data: Package;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      packages: {
        Row: PackageRow;
        Insert: Omit<PackageRow, "created_at" | "updated_at">;
        Update: Partial<PackageRow>;
      };
    };
  };
}

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key);
}

export const supabase = getClient();

export function isSupabaseConfigured() {
  return !!supabase;
}
