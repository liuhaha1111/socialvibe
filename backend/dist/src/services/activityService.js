import { AppError } from "../lib/errors.js";
import { addActivityMember, createActivity, getActivityById, getProfileById, incrementActivityParticipantCount, isActivityMember, listActivities, listFavoriteActivityIds } from "../repositories/activityRepository.js";
import { addProfileToActivityGroup, ensureActivityGroupConversation } from "./chatService.js";
import { ensureProfileForAuthUser } from "./profileService.js";
function toListDto(record, favoriteIds) {
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
        is_favorite: favoriteIds.has(record.id),
        latitude: record.latitude,
        longitude: record.longitude,
        distance_km: record.distance_km
    };
}
export async function getActivities(filters, authUserId, email) {
    const profile = await ensureProfileForAuthUser(authUserId, email);
    const [activities, favoriteIds] = await Promise.all([listActivities(filters), listFavoriteActivityIds(profile.id)]);
    const favoriteSet = new Set(favoriteIds);
    return activities.map((record) => toListDto(record, favoriteSet));
}
export async function getActivityDetail(id) {
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
export async function createActivityForUser(authUserId, input, email) {
    const profile = await ensureProfileForAuthUser(authUserId, email);
    const activity = await createActivity({
        title: input.title,
        image_url: input.image_url,
        location: input.location,
        start_time: input.start_time,
        category: input.category,
        description: input.description,
        host_profile_id: profile.id,
        participant_count: 1,
        max_participants: input.max_participants,
        latitude: input.latitude,
        longitude: input.longitude
    });
    await addActivityMember(activity.id, profile.id);
    await ensureActivityGroupConversation(activity.id, profile.id);
    return activity;
}
export async function joinActivityForUser(authUserId, activityId, email) {
    const profile = await ensureProfileForAuthUser(authUserId, email);
    const activity = await getActivityById(activityId);
    if (!activity) {
        throw new AppError(404, "NOT_FOUND", "Activity not found");
    }
    if (await isActivityMember(activityId, profile.id)) {
        throw new AppError(409, "CONFLICT", "Already joined this activity");
    }
    if (activity.participant_count >= activity.max_participants) {
        throw new AppError(409, "CONFLICT", "Activity is full");
    }
    await addActivityMember(activityId, profile.id);
    const updatedActivity = await incrementActivityParticipantCount(activityId);
    await addProfileToActivityGroup(activityId, profile.id);
    return updatedActivity;
}
