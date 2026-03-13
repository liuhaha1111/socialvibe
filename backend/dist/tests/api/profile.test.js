import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
const AUTH_HEADER = "Bearer test-user:11111111-1111-1111-1111-111111111111";
describe("profile api", () => {
    it("returns current profile", async () => {
        const res = await request(app).get("/api/v1/me/profile").set("Authorization", AUTH_HEADER);
        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe("11111111-1111-1111-1111-111111111111");
    });
    it("updates profile fields", async () => {
        const res = await request(app)
            .put("/api/v1/me/profile")
            .set("Authorization", AUTH_HEADER)
            .send({
            name: "Updated Name",
            location: "Pudong"
        });
        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe("Updated Name");
    });
});
