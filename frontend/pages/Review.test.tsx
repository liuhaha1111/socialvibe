import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Review } from "./Review";

describe("Review", () => {
  it("shows fallback message when no activity is provided", () => {
    render(
      <MemoryRouter initialEntries={["/review"]}>
        <Routes>
          <Route path="/review" element={<Review />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("没有可评价的活动")).toBeInTheDocument();
  });

  it("renders activity info when state exists", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/review",
            state: {
              activity: {
                id: "a1",
                title: "城市漫步",
                image: "",
                location: "上海",
                date: "03/08 周六 18:00",
                participants: 1,
                needed: 5,
                tag: "户外",
                avatars: []
              }
            }
          }
        ]}
      >
        <Routes>
          <Route path="/review" element={<Review />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("活动评价")).toBeInTheDocument();
    expect(screen.getByText("城市漫步")).toBeInTheDocument();
  });
});
