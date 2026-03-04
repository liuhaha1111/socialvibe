import { describe, expect, it, vi } from "vitest";
import { apiGet } from "./api";

describe("apiGet", () => {
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
});
