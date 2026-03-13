import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentProfileMock = vi.fn(async (authUserId: string) => ({
  id: authUserId,
  name: "Auth User",
  avatar_url: "https://example.com/avatar.png",
  bio: "",
  email: "auth@example.com",
  location: ""
}));

vi.mock("../../src/services/profileService.js", () => ({
  getCurrentProfile: getCurrentProfileMock,
  updateCurrentProfile: vi.fn()
}));

const { app } = await import("../../src/app.js");

describe("auth protection api", () => {
  beforeEach(() => {
    getCurrentProfileMock.mockClear();
  });

  it("rejects missing bearer token for /api/v1/me/profile", async () => {
    const res = await request(app).get("/api/v1/me/profile");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHORIZED");
  });

  it("rejects invalid bearer token for /api/v1/me/profile", async () => {
    const res = await request(app)
      .get("/api/v1/me/profile")
      .set("Authorization", "Bearer invalid-token");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHORIZED");
  });

  it("allows a valid bearer token for /api/v1/me/profile", async () => {
    const res = await request(app)
      .get("/api/v1/me/profile")
      .set("Authorization", "Bearer test-user:33333333-3333-4333-8333-333333333333");

    expect(res.status).toBe(200);
    expect(res.body.code).toBe("OK");
    expect(res.body.data.id).toBe("33333333-3333-4333-8333-333333333333");
    expect(getCurrentProfileMock).toHaveBeenCalledWith("33333333-3333-4333-8333-333333333333", expect.any(String));
  });

  it("rejects missing bearer token for POST /api/v1/activities", async () => {
    const res = await request(app).post("/api/v1/activities").send({
      title: "Auth Required Activity",
      location: "Test Location",
      start_time: "2026-03-10T10:00:00.000Z",
      category: "City Walk",
      max_participants: 8
    });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHORIZED");
  });

  it("rejects missing bearer token for POST /api/v1/activities/:id/join", async () => {
    const res = await request(app).post("/api/v1/activities/22222222-2222-2222-2222-222222222221/join");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHORIZED");
  });

  it("rejects missing bearer token for /api/v1/friends/requests", async () => {
    const res = await request(app).get("/api/v1/friends/requests");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHORIZED");
  });

  it("rejects missing bearer token for /api/v1/chat/conversations", async () => {
    const res = await request(app).get("/api/v1/chat/conversations");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHORIZED");
  });
});
