import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatProvider, useChat } from "./ChatContext";

const CONVERSATION_ID = "33333333-3333-3333-3333-333333333331";

describe("ChatContext messages", () => {
  it("loads messages, sends message, and marks read", async () => {
    const fetchMock = vi
      .fn()
      // initial conversations load
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          code: "OK",
          message: "ok",
          data: [
            {
              id: CONVERSATION_ID,
              type: "direct",
              title: "Sarah",
              avatar_url: "https://example.com/a.png",
              last_message: "hello",
              last_message_at: "2026-03-10T10:00:00.000Z",
              unread_count: 1,
              other_profile_id: "11111111-1111-1111-1111-111111111112"
            }
          ]
        })
      })
      // load messages
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          code: "OK",
          message: "ok",
          data: [
            {
              id: "44444444-4444-4444-4444-444444444441",
              conversation_id: CONVERSATION_ID,
              sender_profile_id: "11111111-1111-1111-1111-111111111112",
              sender_name: "Sarah",
              sender_avatar_url: "https://example.com/a.png",
              content: "hello",
              message_type: "text",
              created_at: "2026-03-10T10:00:00.000Z"
            }
          ]
        })
      })
      // mark read
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ code: "OK", message: "ok", data: null })
      })
      // refresh conversations after read
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          code: "OK",
          message: "ok",
          data: [
            {
              id: CONVERSATION_ID,
              type: "direct",
              title: "Sarah",
              avatar_url: "https://example.com/a.png",
              last_message: "hello",
              last_message_at: "2026-03-10T10:00:00.000Z",
              unread_count: 0,
              other_profile_id: "11111111-1111-1111-1111-111111111112"
            }
          ]
        })
      })
      // send message
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          code: "CREATED",
          message: "ok",
          data: {
            id: "44444444-4444-4444-4444-444444444442",
            conversation_id: CONVERSATION_ID,
            sender_profile_id: "11111111-1111-1111-1111-111111111111",
            sender_name: "Me",
            sender_avatar_url: "https://example.com/me.png",
            content: "new message",
            message_type: "text",
            created_at: "2026-03-10T10:05:00.000Z"
          }
        })
      })
      // refresh conversations after send
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          code: "OK",
          message: "ok",
          data: [
            {
              id: CONVERSATION_ID,
              type: "direct",
              title: "Sarah",
              avatar_url: "https://example.com/a.png",
              last_message: "new message",
              last_message_at: "2026-03-10T10:05:00.000Z",
              unread_count: 0,
              other_profile_id: "11111111-1111-1111-1111-111111111112"
            }
          ]
        })
      });

    vi.stubGlobal("fetch", fetchMock);

    const wrapper = ({ children }: { children: React.ReactNode }) => <ChatProvider>{children}</ChatProvider>;
    const { result } = renderHook(() => useChat(), { wrapper });

    await waitFor(() => {
      expect(result.current.conversations.length).toBe(1);
    });

    await act(async () => {
      await result.current.openConversation(CONVERSATION_ID);
    });

    expect(result.current.messagesByConversation[CONVERSATION_ID]?.length).toBe(1);

    await act(async () => {
      await result.current.sendMessage(CONVERSATION_ID, "new message");
    });

    expect(result.current.messagesByConversation[CONVERSATION_ID]?.length).toBe(2);
    expect(result.current.messagesByConversation[CONVERSATION_ID]?.[1].content).toBe("new message");
  });
});
