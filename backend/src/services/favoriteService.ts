import { AppError } from "../lib/errors.js";
import { listActivitiesByIds, listFavoriteActivityIds } from "../repositories/activityRepository.js";
import { createFavorite, deleteFavorite } from "../repositories/favoriteRepository.js";
import { ensureProfileForAuthUser } from "./profileService.js";

export async function listMyFavorites(authUserId: string, email?: string) {
  const profile = await ensureProfileForAuthUser(authUserId, email);
  const favoriteIds = await listFavoriteActivityIds(profile.id);
  const activities = await listActivitiesByIds(favoriteIds);
  return activities;
}

export async function addFavorite(authUserId: string, activityId: string, email?: string) {
  const profile = await ensureProfileForAuthUser(authUserId, email);
  try {
    await createFavorite(profile.id, activityId);
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate key value")) {
      throw new AppError(409, "CONFLICT", "Favorite already exists");
    }
    throw error;
  }
}

export async function removeFavorite(authUserId: string, activityId: string, email?: string) {
  const profile = await ensureProfileForAuthUser(authUserId, email);
  await deleteFavorite(profile.id, activityId);
}
