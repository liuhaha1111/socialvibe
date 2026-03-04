import { getSupabaseAdmin } from "../config/supabase.js";

export interface ActivityRecord {
  id: string;
  title: string;
  image_url: string | null;
  location: string;
  start_time: string;
  category: string;
  description: string | null;
  host_profile_id: string;
  participant_count: number;
  max_participants: number;
}

export interface ProfileRecord {
  id: string;
  name: string;
  avatar_url: string;
}

export async function listActivities(filters: { q?: string; category?: string }): Promise<ActivityRecord[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("activities")
    .select("*")
    .order("start_time", { ascending: true });

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.q) {
    const pattern = `%${filters.q}%`;
    query = query.or(`title.ilike.${pattern},location.ilike.${pattern},category.ilike.${pattern}`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ActivityRecord[];
}

export async function getActivityById(id: string): Promise<ActivityRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as ActivityRecord | null) ?? null;
}

export async function listFavoriteActivityIds(profileId: string): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("favorites")
    .select("activity_id")
    .eq("profile_id", profileId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => row.activity_id as string);
}

export async function getProfileById(id: string): Promise<ProfileRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,avatar_url")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as ProfileRecord | null) ?? null;
}
