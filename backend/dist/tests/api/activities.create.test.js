import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
const AUTH_HEADER = "Bearer test-user:11111111-1111-1111-1111-111111111111";
describe("activity create api", () => {
    it("creates activity with valid payload", async () => {
        const payload = {
            title: "Sunset Walk",
            location: "Central Park",
            start_time: "2026-03-10T10:00:00.000Z",
            category: "City Walk",
            max_participants: 8,
            description: "test create",
            image_url: "https://example.com/a.png",
            latitude: 31.2304,
            longitude: 121.4737
        };
        const res = await request(app).post("/api/v1/activities").set("Authorization", AUTH_HEADER).send(payload);
        expect(res.status).toBe(201);
        expect(res.body.data.title).toBe(payload.title);
    });
    it("returns 400 when title is missing", async () => {
        const res = await request(app)
            .post("/api/v1/activities")
            .set("Authorization", AUTH_HEADER)
            .send({
            location: "x"
        });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe("BAD_REQUEST");
    });
    it("returns 400 when coordinates are missing", async () => {
        const res = await request(app)
            .post("/api/v1/activities")
            .set("Authorization", AUTH_HEADER)
            .send({
            title: "No Coordinates",
            location: "Somewhere",
            start_time: "2026-03-10T10:00:00.000Z",
            category: "City Walk",
            max_participants: 8
        });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe("BAD_REQUEST");
    });
});
