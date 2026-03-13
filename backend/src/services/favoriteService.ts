import { parseEnv } from "../config/env.js";
import { AppError } from "../lib/errors.js";
import { listActivitiesByIds, listFavoriteActivityIds } from "../repositories/activityRepository.js";
import { createFavorite, deleteFavorite } from "../repositories/favoriteRepository.js";

export async function listMyFavorites() {
  const env = parseEnv(process.env);
  const favoriteIds = await listFavoriteActivityIds(env.TEST_PROFILE_ID);
  const activities = await listActivitiesByIds(favoriteIds);
  return activities;
}

export async function addFavorite(activityId: string) {
  const env = parseEnv(process.env);
  try {
    await createFavorite(env.TEST_PROFILE_ID, activityId);
  } catch (error) {
    if (
      error instanceof Error &&
      ((error as Error & { code?: string }).code === "23505" || error.message.includes("duplicate key value"))
    ) {
      throw new AppError(409, "CONFLICT", "Favorite already exists");
    }
    throw error;
  }
}

export async function removeFavorite(activityId: string) {
  const env = parseEnv(process.env);
  await deleteFavorite(env.TEST_PROFILE_ID, activityId);
}
