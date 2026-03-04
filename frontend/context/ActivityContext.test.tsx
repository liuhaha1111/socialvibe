import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActivityProvider, useActivity } from "./ActivityContext";

describe("ActivityContext", () => {
  it("loads remote activities on init", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          code: "OK",
          message: "ok",
          data: [
            {
              id: "22222222-2222-2222-2222-222222222221",
              title: "Activity A",
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
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => <ActivityProvider>{children}</ActivityProvider>;
    const { result } = renderHook(() => useActivity(), { wrapper });

    await waitFor(() => {
      expect(result.current.activities.length).toBe(1);
    });
  });
});
