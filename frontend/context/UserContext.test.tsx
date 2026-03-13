import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
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

  it("omits empty email when updating profile", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
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
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          code: "OK",
          message: "ok",
          data: {
            id: "11111111-1111-1111-1111-111111111111",
            name: "Updated Name",
            avatar_url: "https://example.com/avatar.png",
            bio: "",
            email: "test@example.com",
            location: "Shanghai"
          }
        })
      });

    vi.stubGlobal("fetch", fetchMock);

    const wrapper = ({ children }: { children: React.ReactNode }) => <UserProvider>{children}</UserProvider>;
    const { result } = renderHook(() => useUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.user.name).toBe("Test User");
    });

    await act(async () => {
      await result.current.updateUser({ name: "Updated Name", email: "   " });
    });

    const [, secondCall] = fetchMock.mock.calls;
    const secondBody = secondCall?.[1]?.body as string;
    expect(JSON.parse(secondBody)).toEqual({ name: "Updated Name" });
  });
});
