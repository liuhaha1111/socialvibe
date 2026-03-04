import { parseEnv } from "../config/env.js";
import { AppError } from "../lib/errors.js";
import {
  createActivity,
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

export async function createActivityForTestProfile(input: {
  title: string;
  image_url?: string;
  location: string;
  start_time: string;
  category: string;
  description?: string;
  max_participants: number;
}) {
  const env = parseEnv(process.env);
  const activity = await createActivity({
    title: input.title,
    image_url: input.image_url,
    location: input.location,
    start_time: input.start_time,
    category: input.category,
    description: input.description,
    host_profile_id: env.TEST_PROFILE_ID,
    participant_count: 1,
    max_participants: input.max_participants
  });

  return activity;
}
