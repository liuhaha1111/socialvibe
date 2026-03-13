import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ChatList } from "./ChatList";

const { listConversationsMock } = vi.hoisted(() => ({
  listConversationsMock: vi.fn()
}));

vi.mock("../lib/chatApi", () => ({
  listConversations: listConversationsMock
}));

describe("ChatList", () => {
  it("loads conversations from api", async () => {
    listConversationsMock.mockResolvedValue([
      {
        id: "conv-1",
        type: "direct",
        title: "测试好友",
        avatar_url: null,
        latest_message: {
          id: "msg-1",
          content: "你好",
          sender_profile_id: "p1",
          conversation_id: "conv-1",
          message_type: "text",
          created_at: "2026-03-07T09:00:00.000Z"
        }
      }
    ]);

    render(
      <MemoryRouter initialEntries={["/chat-list"]}>
        <Routes>
          <Route path="/chat-list" element={<ChatList />} />
          <Route path="/chat" element={<div>chat</div>} />
          <Route path="/friends" element={<div>friends</div>} />
          <Route path="/" element={<div>home</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(listConversationsMock).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText("测试好友")).toBeInTheDocument();
    expect(screen.getByText("你好")).toBeInTheDocument();
  });
});
