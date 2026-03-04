import { parseEnv } from "../config/env.js";
import { AppError } from "../lib/errors.js";
import {
  getActivityById,
  getProfileById,
  listActivities,
  listFavoriteActivityIds,
  type ActivityRecord
} from "../repositories/activityRepository.js";

function toListDto(record: ActivityRecord, favoriteIds: Set<string>) {
  return {
    id: record.id,
    title: record.title,
    image_url: record.image_url,
    location: record.location,
    start_time: record.start_time,
    category: record.category,
    description: record.description,
    participant_count: record.participant_count,
    max_participants: record.max_participants,
    is_favorite: favoriteIds.has(record.id)
  };
}

export async function getActivities(filters: { q?: string; category?: string }) {
  const env = parseEnv(process.env);
  const [activities, favoriteIds] = await Promise.all([
    listActivities(filters),
    listFavoriteActivityIds(env.TEST_PROFILE_ID)
  ]);

  const favoriteSet = new Set(favoriteIds);
  return activities.map((record) => toListDto(record, favoriteSet));
}

export async function getActivityDetail(id: string) {
  const activity = await getActivityById(id);
  if (!activity) {
    throw new AppError(404, "NOT_FOUND", "Activity not found");
  }

  const host = await getProfileById(activity.host_profile_id);
  return {
    ...activity,
    host
  };
}
