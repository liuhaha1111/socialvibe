import { createProfileForAuthUser, getProfileByAuthUserId, updateProfileById } from "../repositories/profileRepository.js";
const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop";
function buildDefaultName(authUserId) {
    return `User-${authUserId.slice(0, 8)}`;
}
export async function ensureProfileForAuthUser(authUserId, email) {
    const existing = await getProfileByAuthUserId(authUserId);
    if (existing) {
        return existing;
    }
    return createProfileForAuthUser({
        auth_user_id: authUserId,
        name: buildDefaultName(authUserId),
        avatar_url: DEFAULT_AVATAR,
        bio: "",
        email: email ?? null,
        location: ""
    });
}
export async function getCurrentProfile(authUserId, email) {
    return ensureProfileForAuthUser(authUserId, email);
}
export async function updateCurrentProfile(updates) {
    const profile = await ensureProfileForAuthUser(updates.authUserId, updates.authEmail);
    return updateProfileById(profile.id, {
        name: updates.name,
        bio: updates.bio,
        email: updates.email,
        location: updates.location,
        avatar_url: updates.avatar_url,
        latitude: updates.latitude,
        longitude: updates.longitude
    });
}
