import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActivityProvider, useActivity } from "./ActivityContext";

const ACTIVITY_ID = "22222222-2222-2222-2222-222222222221";

describe("ActivityContext favorites flow", () => {
  it("treats duplicate favorite conflict as idempotent success", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          code: "OK",
          message: "ok",
          data: [
            {
              id: ACTIVITY_ID,
              title: "A",
              image_url: "",
              location: "L",
              start_time: "2026-03-10T00:00:00.000Z",
              category: "City",
              description: "",
              participant_count: 1,
              max_participants: 8,
              is_favorite: false
            }
          ]
        })
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          code: "CONFLICT",
          message: "Favorite already exists",
          data: null
        })
      });

    vi.stubGlobal("fetch", fetchMock);

    const wrapper = ({ children }: { children: React.ReactNode }) => <ActivityProvider>{children}</ActivityProvider>;
    const { result } = renderHook(() => useActivity(), { wrapper });

    await waitFor(() => {
      expect(result.current.activities.length).toBe(1);
    });

    await act(async () => {
      await expect(result.current.toggleFavorite(ACTIVITY_ID)).resolves.toBeUndefined();
    });

    expect(result.current.isFavorite(ACTIVITY_ID)).toBe(true);
  });
});
