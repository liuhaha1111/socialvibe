import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Detail } from "./Detail";

vi.mock("../context/ActivityContext", () => ({
  useActivity: () => ({
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn().mockReturnValue(false),
    refreshActivities: vi.fn()
  })
}));

describe("Detail", () => {
  it("shows not-found message when no activity is passed", () => {
    render(
      <MemoryRouter initialEntries={["/detail"]}>
        <Routes>
          <Route path="/detail" element={<Detail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("活动不存在")).toBeInTheDocument();
  });
});
