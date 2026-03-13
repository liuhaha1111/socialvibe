import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Profile } from "./Profile";

vi.mock("../context/UserContext", () => ({
  useUser: () => ({
    user: {
      id: "11111111-1111-1111-1111-111111111111",
      name: "测试用户",
      avatar: "",
      bio: "hello",
      email: "a@b.com",
      location: "上海"
    }
  })
}));

vi.mock("../context/ActivityContext", () => ({
  useActivity: () => ({
    activities: [
      {
        id: "22222222-2222-2222-2222-222222222222",
        title: "我发起的活动",
        image: "https://example.com/a.jpg",
        location: "静安",
        date: "03/08 周六 18:00",
        participants: 2,
        needed: 6,
        tag: "城市漫步",
        avatars: [],
        isUserCreated: true
      }
    ]
  })
}));

describe("Profile", () => {
  it("renders chinese profile copy and friend entry", () => {
    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/friends" element={<div>friends</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("个人主页")).toBeInTheDocument();
    expect(screen.getByText("好友管理")).toBeInTheDocument();
    expect(screen.getAllByText("我发起的活动").length).toBeGreaterThan(0);
  });
});
