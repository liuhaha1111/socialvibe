import { getSupabaseAdmin } from "../config/supabase.js";

export interface ProfileRecord {
  id: string;
  name: string;
  avatar_url: string;
  bio: string | null;
  email: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  location_updated_at: string | null;
}

interface ProfileRow extends ProfileRecord {
  auth_user_id: string | null;
}

function mapRowToRecord(row: ProfileRow): ProfileRecord {
  return {
    id: row.id,
    name: row.name,
    avatar_url: row.avatar_url,
    bio: row.bio,
    email: row.email,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    location_updated_at: row.location_updated_at
  };
}

const SELECT_PROFILE_COLUMNS = "id,name,avatar_url,bio,email,location,latitude,longitude,location_updated_at,auth_user_id";

export async function getProfileById(id: string): Promise<ProfileRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("profiles").select(SELECT_PROFILE_COLUMNS).eq("id", id).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapRowToRecord(data as ProfileRow);
}

export async function getProfileByAuthUserId(authUserId: string): Promise<ProfileRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select(SELECT_PROFILE_COLUMNS)
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapRowToRecord(data as ProfileRow);
}

export async function createProfileForAuthUser(input: {
  auth_user_id: string;
  name: string;
  avatar_url: string;
  bio?: string | null;
  email?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<ProfileRecord> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      auth_user_id: input.auth_user_id,
      name: input.name,
      avatar_url: input.avatar_url,
      bio: input.bio ?? null,
      email: input.email ?? null,
      location: input.location ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      location_updated_at: input.latitude != null && input.longitude != null ? new Date().toISOString() : null
    })
    .select(SELECT_PROFILE_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToRecord(data as ProfileRow);
}

export async function updateProfileById(
  id: string,
  updates: Partial<Pick<ProfileRecord, "name" | "bio" | "email" | "location" | "avatar_url" | "latitude" | "longitude">>
): Promise<ProfileRecord> {
  const supabase = getSupabaseAdmin();
  const shouldUpdateLocationTime = updates.latitude !== undefined || updates.longitude !== undefined;
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      ...(shouldUpdateLocationTime ? { location_updated_at: new Date().toISOString() } : {}),
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select(SELECT_PROFILE_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToRecord(data as ProfileRow);
}
