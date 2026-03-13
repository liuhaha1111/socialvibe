import request from "supertest";
import { describe, expect, it, vi } from "vitest";

const updateCurrentProfileMock = vi.fn(async (payload: {
  authUserId: string;
  authEmail?: string;
  name?: string;
}) => ({
  id: "11111111-1111-1111-1111-111111111111",
  name: payload.name ?? "Updated Name",
  avatar_url: "https://example.com/avatar.png",
  bio: "",
  email: "test@example.com",
  location: "Shanghai"
}));

vi.mock("../../src/services/profileService.js", () => ({
  getCurrentProfile: vi.fn(),
  updateCurrentProfile: updateCurrentProfileMock
}));

const { app } = await import("../../src/app.js");

describe("profile api empty email handling", () => {
  it("accepts empty email input by omitting email update", async () => {
    const res = await request(app)
      .put("/api/v1/me/profile")
      .set("Authorization", "Bearer test-user:11111111-1111-1111-1111-111111111111")
      .send({
        name: "Updated Name",
        email: "   "
      });

    expect(res.status).toBe(200);
    expect(res.body.code).toBe("OK");
    expect(updateCurrentProfileMock).toHaveBeenCalledTimes(1);

    const [arg] = updateCurrentProfileMock.mock.calls[0] as [Record<string, unknown>];
    expect(arg.authUserId).toBe("11111111-1111-1111-1111-111111111111");
    expect(arg.name).toBe("Updated Name");
    expect(arg.email).toBeUndefined();
  });
});
