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
  latitude: number | null;
  longitude: number | null;
  distance_km?: number;
}

export interface CreateActivityInput {
  title: string;
  image_url?: string;
  location: string;
  start_time: string;
  category: string;
  description?: string;
  host_profile_id: string;
  participant_count: number;
  max_participants: number;
  latitude: number;
  longitude: number;
}

export interface ProfileRecord {
  id: string;
  name: string;
  avatar_url: string;
}

const EARTH_RADIUS_KM = 6371;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversineDistanceKm(fromLat: number, fromLng: number, toLat: number, toLng: number): number {
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export async function listActivities(filters: {
  q?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
}): Promise<ActivityRecord[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("activities").select("*").order("start_time", { ascending: true });

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

  const rows = (data ?? []) as ActivityRecord[];
  const { latitude, longitude } = filters;
  if (latitude === undefined || longitude === undefined) {
    return rows;
  }

  const radiusKm = filters.radius_km ?? 20;
  return rows
    .reduce<ActivityRecord[]>((acc, row) => {
      if (row.latitude == null || row.longitude == null) {
        return acc;
      }

      const distanceKm = haversineDistanceKm(latitude, longitude, row.latitude, row.longitude);
      if (distanceKm > radiusKm) {
        return acc;
      }

      acc.push({
        ...row,
        distance_km: Number(distanceKm.toFixed(2))
      });
      return acc;
    }, [])
    .sort((a, b) => (a.distance_km ?? Number.MAX_SAFE_INTEGER) - (b.distance_km ?? Number.MAX_SAFE_INTEGER));
}

export async function getActivityById(id: string): Promise<ActivityRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("activities").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as ActivityRecord | null) ?? null;
}

export async function listFavoriteActivityIds(profileId: string): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("favorites").select("activity_id").eq("profile_id", profileId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => row.activity_id as string);
}

export async function getProfileById(id: string): Promise<ProfileRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("profiles").select("id,name,avatar_url").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as ProfileRecord | null) ?? null;
}

export async function createActivity(input: CreateActivityInput): Promise<ActivityRecord> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("activities")
    .insert({
      title: input.title,
      image_url: input.image_url ?? null,
      location: input.location,
      start_time: input.start_time,
      category: input.category,
      description: input.description ?? null,
      host_profile_id: input.host_profile_id,
      participant_count: input.participant_count,
      max_participants: input.max_participants,
      latitude: input.latitude,
      longitude: input.longitude
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ActivityRecord;
}

export async function listActivitiesByIds(ids: string[]): Promise<ActivityRecord[]> {
  if (ids.length === 0) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("activities").select("*").in("id", ids).order("start_time", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ActivityRecord[];
}

export async function addActivityMember(activityId: string, profileId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("activity_members").upsert(
    {
      activity_id: activityId,
      profile_id: profileId
    },
    { onConflict: "activity_id,profile_id" }
  );
  if (error) {
    throw new Error(error.message);
  }
}

export async function isActivityMember(activityId: string, profileId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("activity_members")
    .select("activity_id")
    .eq("activity_id", activityId)
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return Boolean(data);
}

export async function incrementActivityParticipantCount(activityId: string): Promise<ActivityRecord> {
  const current = await getActivityById(activityId);
  if (!current) {
    throw new Error("Activity not found");
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("activities")
    .update({
      participant_count: current.participant_count + 1,
      updated_at: new Date().toISOString()
    })
    .eq("id", activityId)
    .select("*")
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data as ActivityRecord;
}
