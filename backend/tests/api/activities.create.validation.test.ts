import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

describe("activity create validation api", () => {
  it("returns 400 BAD_REQUEST when start_time is invalid", async () => {
    const res = await request(app).post("/api/v1/activities").send({
      title: "Invalid datetime",
      location: "x",
      start_time: "not-a-date",
      category: "test",
      max_participants: 4
    });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("BAD_REQUEST");
  });
});
