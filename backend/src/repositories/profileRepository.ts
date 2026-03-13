import { getSupabaseAdmin } from "../config/supabase.js";

export interface ProfileRecord {
  id: string;
  name: string;
  avatar_url: string;
  bio: string | null;
  email: string | null;
  location: string | null;
}

export async function getProfileById(id: string): Promise<ProfileRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,avatar_url,bio,email,location")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as ProfileRecord | null) ?? null;
}

export async function updateProfileById(
  id: string,
  updates: Partial<
    Pick<ProfileRecord, "name" | "bio" | "location" | "avatar_url"> & {
      email: string | null;
    }
  >
): Promise<ProfileRecord> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("id,name,avatar_url,bio,email,location")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ProfileRecord;
}
