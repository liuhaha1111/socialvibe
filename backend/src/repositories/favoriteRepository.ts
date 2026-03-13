import { getSupabaseAdmin } from "../config/supabase.js";

export async function createFavorite(profileId: string, activityId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("favorites").insert({
    profile_id: profileId,
    activity_id: activityId
  });

  if (error) {
    throw Object.assign(new Error(error.message), {
      code: error.code ?? undefined
    });
  }
}

export async function deleteFavorite(profileId: string, activityId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("profile_id", profileId)
    .eq("activity_id", activityId);

  if (error) {
    throw new Error(error.message);
  }
}
