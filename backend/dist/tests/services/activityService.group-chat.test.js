import { beforeEach, describe, expect, it, vi } from "vitest";
const ensureProfileForAuthUserMock = vi.fn();
const createActivityMock = vi.fn();
const getActivityByIdMock = vi.fn();
const listActivitiesMock = vi.fn();
const listFavoriteActivityIdsMock = vi.fn();
const getProfileByIdMock = vi.fn();
const addActivityMemberMock = vi.fn();
const isActivityMemberMock = vi.fn();
const incrementActivityParticipantCountMock = vi.fn();
const ensureActivityGroupConversationMock = vi.fn();
const addProfileToActivityGroupMock = vi.fn();
vi.mock("../../src/services/profileService.js", () => ({
    ensureProfileForAuthUser: ensureProfileForAuthUserMock
}));
vi.mock("../../src/repositories/activityRepository.js", () => ({
    createActivity: createActivityMock,
    getActivityById: getActivityByIdMock,
    getProfileById: getProfileByIdMock,
    listActivities: listActivitiesMock,
    listFavoriteActivityIds: listFavoriteActivityIdsMock,
    addActivityMember: addActivityMemberMock,
    isActivityMember: isActivityMemberMock,
    incrementActivityParticipantCount: incrementActivityParticipantCountMock
}));
vi.mock("../../src/services/chatService.js", () => ({
    ensureActivityGroupConversation: ensureActivityGroupConversationMock,
    addProfileToActivityGroup: addProfileToActivityGroupMock
}));
const { createActivityForUser, joinActivityForUser } = await import("../../src/services/activityService.js");
describe("activity service group-chat sync", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it("creates host membership and activity group conversation when activity is created", async () => {
        ensureProfileForAuthUserMock.mockResolvedValue({
            id: "11111111-1111-1111-1111-111111111111"
        });
        createActivityMock.mockResolvedValue({
            id: "22222222-2222-2222-2222-222222222222",
            title: "City Walk",
            image_url: null,
            location: "Shanghai",
            start_time: "2026-03-20T10:00:00.000Z",
            category: "City Walk",
            description: null,
            host_profile_id: "11111111-1111-1111-1111-111111111111",
            participant_count: 1,
            max_participants: 8
        });
        const created = await createActivityForUser("auth-user-1", {
            title: "City Walk",
            location: "Shanghai",
            start_time: "2026-03-20T10:00:00.000Z",
            category: "City Walk",
            max_participants: 8,
            latitude: 31.2304,
            longitude: 121.4737
        });
        expect(created.id).toBe("22222222-2222-2222-2222-222222222222");
        expect(addActivityMemberMock).toHaveBeenCalledWith("22222222-2222-2222-2222-222222222222", "11111111-1111-1111-1111-111111111111");
        expect(ensureActivityGroupConversationMock).toHaveBeenCalledWith("22222222-2222-2222-2222-222222222222", "11111111-1111-1111-1111-111111111111");
    });
    it("adds participant into activity members and group chat on join", async () => {
        ensureProfileForAuthUserMock.mockResolvedValue({
            id: "33333333-3333-4333-8333-333333333333"
        });
        getActivityByIdMock.mockResolvedValue({
            id: "22222222-2222-2222-2222-222222222222",
            title: "City Walk",
            image_url: null,
            location: "Shanghai",
            start_time: "2026-03-20T10:00:00.000Z",
            category: "City Walk",
            description: null,
            host_profile_id: "11111111-1111-1111-1111-111111111111",
            participant_count: 1,
            max_participants: 8
        });
        isActivityMemberMock.mockResolvedValue(false);
        incrementActivityParticipantCountMock.mockResolvedValue({
            id: "22222222-2222-2222-2222-222222222222",
            participant_count: 2
        });
        const joined = await joinActivityForUser("auth-user-2", "22222222-2222-2222-2222-222222222222");
        expect(joined.id).toBe("22222222-2222-2222-2222-222222222222");
        expect(addActivityMemberMock).toHaveBeenCalledWith("22222222-2222-2222-2222-222222222222", "33333333-3333-4333-8333-333333333333");
        expect(incrementActivityParticipantCountMock).toHaveBeenCalledWith("22222222-2222-2222-2222-222222222222");
        expect(addProfileToActivityGroupMock).toHaveBeenCalledWith("22222222-2222-2222-2222-222222222222", "33333333-3333-4333-8333-333333333333");
    });
});
