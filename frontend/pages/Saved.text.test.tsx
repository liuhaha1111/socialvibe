import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Saved } from "./Saved";

vi.mock("../context/ActivityContext", () => ({
  useActivity: () => ({
    activities: [],
    favorites: [],
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn().mockReturnValue(false)
  })
}));

describe("Saved", () => {
  it("renders chinese empty state copy", () => {
    render(
      <MemoryRouter initialEntries={["/saved"]}>
        <Routes>
          <Route path="/saved" element={<Saved />} />
          <Route path="/" element={<div>home</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("我的收藏")).toBeInTheDocument();
    expect(screen.getByText("暂无收藏")).toBeInTheDocument();
  });
});
