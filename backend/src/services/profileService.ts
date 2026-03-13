import { parseEnv } from "../config/env.js";
import { AppError } from "../lib/errors.js";
import { getProfileById, updateProfileById } from "../repositories/profileRepository.js";

export async function getCurrentProfile() {
  const env = parseEnv(process.env);
  const profile = await getProfileById(env.TEST_PROFILE_ID);
  if (!profile) {
    throw new AppError(404, "NOT_FOUND", "Profile not found");
  }
  return profile;
}

export async function updateCurrentProfile(updates: {
  name?: string;
  bio?: string;
  email?: string | null;
  location?: string;
  avatar_url?: string;
}) {
  const env = parseEnv(process.env);
  const profile = await updateProfileById(env.TEST_PROFILE_ID, updates);
  return profile;
}
