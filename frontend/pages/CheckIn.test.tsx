import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CheckIn } from "./CheckIn";

describe("CheckIn", () => {
  it("shows fallback message when no activity is provided", () => {
    render(
      <MemoryRouter initialEntries={["/checkin"]}>
        <Routes>
          <Route path="/checkin" element={<CheckIn />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("没有可签到的活动")).toBeInTheDocument();
  });

  it("renders activity info when state exists", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/checkin",
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
          <Route path="/checkin" element={<CheckIn />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("活动签到")).toBeInTheDocument();
    expect(screen.getByText("城市漫步")).toBeInTheDocument();
  });
});
