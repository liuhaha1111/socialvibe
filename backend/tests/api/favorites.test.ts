import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app";

describe("favorites api", () => {
  it("adds favorite, lists it, removes it", async () => {
    const list = await request(app).get("/api/v1/activities");
    const activityId = list.body.data[0].id as string;

    const add = await request(app).post(`/api/v1/me/favorites/${activityId}`);
    expect(add.status).toBe(201);

    const saved = await request(app).get("/api/v1/me/favorites");
    expect(saved.status).toBe(200);
    expect(saved.body.data.some((x: { id: string }) => x.id === activityId)).toBe(true);

    const del = await request(app).delete(`/api/v1/me/favorites/${activityId}`);
    expect(del.status).toBe(204);
  });
});
