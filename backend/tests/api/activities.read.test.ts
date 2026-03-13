import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

const AUTH_HEADER = "Bearer test-user:11111111-1111-1111-1111-111111111111";

describe("activity read api", () => {
  it("GET /api/v1/activities returns array", async () => {
    const res = await request(app).get("/api/v1/activities").set("Authorization", AUTH_HEADER);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/v1/activities/:id returns 404 for unknown id", async () => {
    const res = await request(app)
      .get("/api/v1/activities/00000000-0000-0000-0000-000000000000")
      .set("Authorization", AUTH_HEADER);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("NOT_FOUND");
  });
});
