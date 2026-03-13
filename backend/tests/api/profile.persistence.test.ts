import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

describe("profile persistence api", () => {
  it("persists profile update and returns latest state", async () => {
    const before = await request(app).get("/api/v1/me/profile");
    expect(before.status).toBe(200);

    const uniqueBio = `bio-${Date.now()}`;
    const res = await request(app).put("/api/v1/me/profile").send({
      name: `Persistence ${Date.now()}`,
      bio: uniqueBio,
      email: "",
      location: `L-${Date.now()}`
    });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toContain("Persistence");
    expect(res.body.data.email).toBeNull();
    expect(res.body.data.bio).toBe(uniqueBio);

    const after = await request(app).get("/api/v1/me/profile");
    expect(after.status).toBe(200);
    expect(after.body.data.email).toBeNull();
    expect(after.body.data.id).toBe(before.body.data.id);

    await request(app).put("/api/v1/me/profile").send({
      name: before.body.data.name,
      bio: before.body.data.bio ?? "",
      email: before.body.data.email ?? "",
      location: before.body.data.location ?? ""
    });
  });
});
