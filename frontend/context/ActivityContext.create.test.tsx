import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActivityProvider, useActivity } from "./ActivityContext";

describe("ActivityContext create flow", () => {
  it("does not mutate activities when create request fails", async () => {
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
              id: "22222222-2222-2222-2222-222222222221",
              title: "Seed Activity",
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
        status: 500,
        json: async () => ({
          code: "INTERNAL_ERROR",
          message: "create failed",
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
      await expect(
        result.current.createActivity({
          title: "New Activity",
          location: "X",
          start_time: "2026-03-10T08:00:00.000Z",
          category: "Test",
          max_participants: 6
        })
      ).rejects.toThrow("create failed");
    });

    expect(result.current.activities.length).toBe(1);
    expect(result.current.activities[0].title).toBe("Seed Activity");
  });
});
