import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatProvider, useChat } from "./ChatContext";

describe("ChatContext conversations", () => {
  it("loads conversation list and unread counts", async () => {
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
              id: "33333333-3333-3333-3333-333333333331",
              type: "direct",
              title: "Sarah",
              avatar_url: "https://example.com/a.png",
              last_message: "hello",
              last_message_at: "2026-03-10T10:00:00.000Z",
              unread_count: 2,
              other_profile_id: "11111111-1111-1111-1111-111111111112"
            }
          ]
        })
      })
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => <ChatProvider>{children}</ChatProvider>;
    const { result } = renderHook(() => useChat(), { wrapper });

    await waitFor(() => {
      expect(result.current.conversations.length).toBe(1);
      expect(result.current.conversations[0].unread_count).toBe(2);
    });
  });
});
