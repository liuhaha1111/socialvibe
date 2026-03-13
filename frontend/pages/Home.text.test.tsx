import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Home } from "./Home";

vi.mock("../context/UserContext", () => ({
  useUser: () => ({
    user: {
      id: "11111111-1111-1111-1111-111111111111",
      name: "测试用户",
      avatar: "",
      bio: "",
      email: "",
      location: "上海"
    }
  })
}));

vi.mock("../context/ActivityContext", () => ({
  useActivity: () => ({
    activities: [
      {
        id: "22222222-2222-2222-2222-222222222222",
        title: "真实活动标题",
        image: "https://example.com/a.jpg",
        location: "静安",
        date: "03/08 周六 18:00",
        participants: 2,
        needed: 6,
        tag: "城市漫步",
        avatars: [],
        full: false
      }
    ],
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn().mockReturnValue(false)
  })
}));

describe("Home", () => {
  it("renders chinese home copy", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/detail" element={<div>detail</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("热门推荐")).toBeInTheDocument();
    expect(screen.getAllByText("真实活动标题").length).toBeGreaterThan(0);
    expect(screen.queryByText("霓虹夜色摄影漫步")).not.toBeInTheDocument();
  });
});
