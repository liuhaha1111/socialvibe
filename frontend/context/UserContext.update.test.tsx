import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UserProvider, useUser } from "./UserContext";

describe("UserContext update flow", () => {
  it("sends nullable email and uses server response as source of truth", async () => {
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
            name: "Init User",
            avatar_url: "https://example.com/a.png",
            bio: "",
            email: "init@example.com",
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
            name: "Canonical Server Name",
            avatar_url: "https://example.com/a.png",
            bio: "Server bio",
            email: null,
            location: "Pudong"
          }
        })
      });

    vi.stubGlobal("fetch", fetchMock);

    const wrapper = ({ children }: { children: React.ReactNode }) => <UserProvider>{children}</UserProvider>;
    const { result } = renderHook(() => useUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.user.name).toBe("Init User");
    });

    await act(async () => {
      await result.current.updateUser({
        name: "Client Side Name",
        email: "",
        location: "Pudong"
      });
    });

    const putCall = fetchMock.mock.calls[1];
    const rawBody = putCall?.[1]?.body as string;
    const payload = JSON.parse(rawBody);
    expect(payload.email).toBeNull();

    expect(result.current.user.name).toBe("Canonical Server Name");
    expect(result.current.user.email).toBe("");
    expect(result.current.user.location).toBe("Pudong");
  });
});
