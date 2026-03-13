import { AppError } from "../lib/errors.js";
import { getProfileById } from "../repositories/profileRepository.js";
import { areFriends, createFriendRequest, createFriendship, getFriendRequestById, listDiscoverProfiles, listFriendProfiles, listFriendRequestsForProfile, updateFriendRequestStatus } from "../repositories/friendRepository.js";
import { ensureProfileForAuthUser } from "./profileService.js";
export async function sendFriendRequest(authUserId, targetProfileId, email) {
    const me = await ensureProfileForAuthUser(authUserId, email);
    if (me.id === targetProfileId) {
        throw new AppError(400, "BAD_REQUEST", "Cannot add yourself");
    }
    const target = await getProfileById(targetProfileId);
    if (!target) {
        throw new AppError(404, "NOT_FOUND", "Target profile not found");
    }
    if (await areFriends(me.id, targetProfileId)) {
        throw new AppError(409, "CONFLICT", "Already friends");
    }
    try {
        return await createFriendRequest(me.id, targetProfileId);
    }
    catch (error) {
        if (error instanceof Error && error.message.includes("duplicate")) {
            throw new AppError(409, "CONFLICT", "Friend request already pending");
        }
        throw error;
    }
}
export async function listFriendRequests(authUserId, email) {
    const me = await ensureProfileForAuthUser(authUserId, email);
    const requests = await listFriendRequestsForProfile(me.id);
    return Promise.all(requests.map(async (request) => {
        const [fromProfile, toProfile] = await Promise.all([
            getProfileById(request.from_profile_id),
            getProfileById(request.to_profile_id)
        ]);
        return {
            ...request,
            from_profile: fromProfile,
            to_profile: toProfile
        };
    }));
}
export async function respondFriendRequest(authUserId, requestId, status, email) {
    const me = await ensureProfileForAuthUser(authUserId, email);
    const request = await getFriendRequestById(requestId);
    if (!request) {
        throw new AppError(404, "NOT_FOUND", "Friend request not found");
    }
    if (request.to_profile_id !== me.id) {
        throw new AppError(403, "FORBIDDEN", "Not allowed to respond to this request");
    }
    if (request.status !== "pending") {
        throw new AppError(409, "CONFLICT", "Friend request already handled");
    }
    const updated = await updateFriendRequestStatus(requestId, status);
    if (status === "accepted") {
        await createFriendship(request.from_profile_id, request.to_profile_id);
    }
    return updated;
}
export async function listFriends(authUserId, email) {
    const me = await ensureProfileForAuthUser(authUserId, email);
    return listFriendProfiles(me.id);
}
export async function discoverProfiles(authUserId, email, keyword) {
    const me = await ensureProfileForAuthUser(authUserId, email);
    return listDiscoverProfiles(me.id, keyword);
}
export async function assertAreFriends(profileA, profileB) {
    if (!(await areFriends(profileA, profileB))) {
        throw new AppError(403, "FORBIDDEN", "Only friends can start direct chat");
    }
}
