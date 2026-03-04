import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { parseEnv } from "./env.js";

let supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  const env = parseEnv(process.env);
  supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return supabaseAdmin;
}
