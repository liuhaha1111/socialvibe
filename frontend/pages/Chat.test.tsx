import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Chat } from "./Chat";

const { listMessagesMock, sendMessageMock, unsubscribeMock } = vi.hoisted(() => ({
  listMessagesMock: vi.fn(),
  sendMessageMock: vi.fn(),
  unsubscribeMock: vi.fn()
}));

vi.mock("../lib/chatApi", () => ({
  listMessages: listMessagesMock,
  sendMessage: sendMessageMock
}));

vi.mock("../lib/supabase", () => ({
  supabase: {
    channel: () => ({
      on: () => ({
        subscribe: () => ({ unsubscribe: unsubscribeMock })
      }),
      unsubscribe: unsubscribeMock
    })
  }
}));

vi.mock("../context/UserContext", () => ({
  useUser: () => ({
    user: {
      id: "11111111-1111-1111-1111-111111111111"
    }
  })
}));

describe("Chat", () => {
  it("loads messages from api for the selected conversation", async () => {
    listMessagesMock.mockResolvedValue([
      {
        id: "msg-1",
        conversation_id: "conv-1",
        sender_profile_id: "11111111-1111-1111-1111-111111111111",
        content: "来自接口的消息",
        message_type: "text",
        created_at: "2026-03-07T09:00:00.000Z"
      }
    ]);

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/chat",
            state: {
              conversation: {
                id: "conv-1",
                title: "测试会话",
                type: "direct"
              }
            }
          }
        ]}
      >
        <Routes>
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat-list" element={<div>chat-list</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(listMessagesMock).toHaveBeenCalledWith("conv-1");
    });
    expect(screen.getByText("来自接口的消息")).toBeInTheDocument();
  });
});
