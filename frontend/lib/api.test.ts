import { describe, expect, it, vi } from "vitest";
import { apiGet, setAccessTokenProvider } from "./api";

describe("apiGet", () => {
  it("attaches bearer token when access token provider returns a token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ code: "OK", message: "ok", data: { value: 1 } })
    });
    vi.stubGlobal("fetch", fetchMock);

    setAccessTokenProvider(() => "token-123");
    await apiGet<{ value: number }>("/api/v1/protected");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/protected",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-123"
        })
      })
    );

    setAccessTokenProvider(null);
  });

  it("throws backend message on non-2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: "boom" })
      })
    );

    await expect(apiGet("/api/v1/fail")).rejects.toThrow("boom");
  });

  it("dispatches unauthorized event on 401 response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: "Invalid or expired token" })
      })
    );

    let fired = false;
    const onUnauthorized = () => {
      fired = true;
    };
    window.addEventListener("auth:unauthorized", onUnauthorized);

    await expect(apiGet("/api/v1/protected")).rejects.toThrow("Invalid or expired token");

    window.removeEventListener("auth:unauthorized", onUnauthorized);
    expect(fired).toBe(true);
  });
});
