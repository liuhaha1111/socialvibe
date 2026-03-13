import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

const SARAH_ID = "11111111-1111-1111-1111-111111111112";

describe("chat conversations api", () => {
  it("GET /api/v1/me/conversations returns list with unread_count", async () => {
    const res = await request(app).get("/api/v1/me/conversations");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(typeof res.body.data[0].unread_count).toBe("number");
  });

  it("POST /api/v1/me/conversations/direct creates or returns a direct thread", async () => {
    const res = await request(app).post("/api/v1/me/conversations/direct").send({
      partner_profile_id: SARAH_ID
    });

    expect([200, 201]).toContain(res.status);
    expect(res.body.data.type).toBe("direct");
    expect(res.body.data.id).toBeTypeOf("string");
  });

  it("GET /api/v1/me/notifications returns system messages", async () => {
    const res = await request(app).get("/api/v1/me/notifications");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty("is_read");
  });
});
