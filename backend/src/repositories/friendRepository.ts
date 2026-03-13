import { getSupabaseAdmin } from "../config/supabase.js";

export interface FriendRequestRecord {
  id: string;
  from_profile_id: string;
  to_profile_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  responded_at: string | null;
}

function normalizePair(a: string, b: string): { low: string; high: string } {
  return a < b ? { low: a, high: b } : { low: b, high: a };
}

export async function createFriendRequest(fromProfileId: string, toProfileId: string): Promise<FriendRequestRecord> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("friend_requests")
    .insert({
      from_profile_id: fromProfileId,
      to_profile_id: toProfileId,
      status: "pending"
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as FriendRequestRecord;
}

export async function listFriendRequestsForProfile(profileId: string): Promise<FriendRequestRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("friend_requests")
    .select("*")
    .or(`from_profile_id.eq.${profileId},to_profile_id.eq.${profileId}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as FriendRequestRecord[];
}

export async function getFriendRequestById(requestId: string): Promise<FriendRequestRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("friend_requests").select("*").eq("id", requestId).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return (data as FriendRequestRecord | null) ?? null;
}

export async function updateFriendRequestStatus(
  requestId: string,
  status: "accepted" | "rejected"
): Promise<FriendRequestRecord> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("friend_requests")
    .update({
      status,
      responded_at: new Date().toISOString()
    })
    .eq("id", requestId)
    .select("*")
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data as FriendRequestRecord;
}

export async function createFriendship(profileA: string, profileB: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const pair = normalizePair(profileA, profileB);
  const { error } = await supabase.from("friendships").upsert(
    {
      profile_low: pair.low,
      profile_high: pair.high
    },
    { onConflict: "profile_low,profile_high" }
  );
  if (error) {
    throw new Error(error.message);
  }
}

export async function areFriends(profileA: string, profileB: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const pair = normalizePair(profileA, profileB);
  const { data, error } = await supabase
    .from("friendships")
    .select("id")
    .eq("profile_low", pair.low)
    .eq("profile_high", pair.high)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return Boolean(data);
}

export interface FriendProfileRecord {
  id: string;
  name: string;
  avatar_url: string;
  bio: string | null;
  email: string | null;
  location: string | null;
}

export async function listFriendProfiles(profileId: string): Promise<FriendProfileRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("friendships")
    .select("profile_low,profile_high")
    .or(`profile_low.eq.${profileId},profile_high.eq.${profileId}`);
  if (error) {
    throw new Error(error.message);
  }

  const friendIds = (data ?? []).map((row) =>
    row.profile_low === profileId ? (row.profile_high as string) : (row.profile_low as string)
  );
  if (friendIds.length === 0) {
    return [];
  }

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id,name,avatar_url,bio,email,location")
    .in("id", friendIds);
  if (profileError) {
    throw new Error(profileError.message);
  }
  return (profiles ?? []) as FriendProfileRecord[];
}

export async function listDiscoverProfiles(profileId: string, keyword?: string): Promise<FriendProfileRecord[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("profiles").select("id,name,avatar_url,bio,email,location").neq("id", profileId).limit(20);
  if (keyword) {
    const pattern = `%${keyword}%`;
    query = query.or(`name.ilike.${pattern},email.ilike.${pattern},location.ilike.${pattern}`);
  }
  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as FriendProfileRecord[];
}
