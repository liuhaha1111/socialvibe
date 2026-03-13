import request from "supertest";
import { describe, expect, it, vi } from "vitest";
const getActivitiesMock = vi.fn(async () => []);
vi.mock("../../src/services/activityService.js", () => ({
    getActivities: getActivitiesMock,
    getActivityDetail: vi.fn(),
    createActivityForUser: vi.fn(),
    joinActivityForUser: vi.fn()
}));
const { app } = await import("../../src/app.js");
const AUTH_HEADER = "Bearer test-user:11111111-1111-1111-1111-111111111111";
describe("activity api location filters", () => {
    it("passes parsed numeric location filters to activity service", async () => {
        const res = await request(app)
            .get("/api/v1/activities?latitude=31.2304&longitude=121.4737&radius_km=5")
            .set("Authorization", AUTH_HEADER);
        expect(res.status).toBe(200);
        expect(getActivitiesMock).toHaveBeenCalledTimes(1);
        const [filters] = getActivitiesMock.mock.calls[0];
        expect(filters.latitude).toBe(31.2304);
        expect(filters.longitude).toBe(121.4737);
        expect(filters.radius_km).toBe(5);
    });
    it("rejects request when only one coordinate is provided", async () => {
        const res = await request(app).get("/api/v1/activities?latitude=31.2304").set("Authorization", AUTH_HEADER);
        expect(res.status).toBe(400);
        expect(res.body.code).toBe("BAD_REQUEST");
    });
});
