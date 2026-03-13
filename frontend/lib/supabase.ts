import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "http://127.0.0.1:28000";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "dev-only-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
