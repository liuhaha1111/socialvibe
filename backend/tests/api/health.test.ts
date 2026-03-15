import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

describe("health", () => {
  const previousAllowedOrigins = process.env.CORS_ALLOWED_ORIGINS;

  afterEach(() => {
    if (previousAllowedOrigins === undefined) {
      delete process.env.CORS_ALLOWED_ORIGINS;
      return;
    }

    process.env.CORS_ALLOWED_ORIGINS = previousAllowedOrigins;
  });

  it("GET /api/v1/health returns ok", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.code).toBe("OK");
  });

  it("sets CORS headers for allowed origin", async () => {
    process.env.CORS_ALLOWED_ORIGINS = "https://socialvibe-web.up.railway.app";

    const res = await request(app)
      .get("/api/v1/health")
      .set("Origin", "https://socialvibe-web.up.railway.app");

    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe("https://socialvibe-web.up.railway.app");
    expect(res.headers.vary).toContain("Origin");
  });

  it("responds to CORS preflight with 204", async () => {
    process.env.CORS_ALLOWED_ORIGINS = "https://socialvibe-web.up.railway.app";

    const res = await request(app)
      .options("/api/v1/health")
      .set("Origin", "https://socialvibe-web.up.railway.app")
      .set("Access-Control-Request-Method", "GET");

    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe("https://socialvibe-web.up.railway.app");
  });
});
