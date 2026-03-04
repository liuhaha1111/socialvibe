import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UserProvider, useUser } from "./UserContext";

describe("UserContext", () => {
  it("loads profile from backend", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          code: "OK",
          message: "ok",
          data: {
            id: "11111111-1111-1111-1111-111111111111",
            name: "Test User",
            avatar_url: "https://example.com/avatar.png",
            bio: "",
            email: "test@example.com",
            location: "Shanghai"
          }
        })
      })
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => <UserProvider>{children}</UserProvider>;
    const { result } = renderHook(() => useUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.user.name).toBe("Test User");
    });
  });
});
