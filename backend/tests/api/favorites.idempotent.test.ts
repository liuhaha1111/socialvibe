import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

describe("favorites idempotent api", () => {
  it("returns 409 on duplicate favorite create", async () => {
    const created = await request(app).post("/api/v1/activities").send({
      title: `Favorite Duplicate ${Date.now()}`,
      location: "Shanghai",
      start_time: "2026-03-10T10:00:00.000Z",
      category: "Test",
      max_participants: 5
    });
    expect(created.status).toBe(201);

    const activityId = created.body.data.id as string;
    const first = await request(app).post(`/api/v1/me/favorites/${activityId}`);
    expect(first.status).toBe(201);

    const second = await request(app).post(`/api/v1/me/favorites/${activityId}`);
    expect(second.status).toBe(409);
    expect(second.body.code).toBe("CONFLICT");
  });
});
