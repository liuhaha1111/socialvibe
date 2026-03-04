import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app";

describe("activity read api", () => {
  it("GET /api/v1/activities returns array", async () => {
    const res = await request(app).get("/api/v1/activities");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/v1/activities/:id returns 404 for unknown id", async () => {
    const res = await request(app).get("/api/v1/activities/00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("NOT_FOUND");
  });
});
