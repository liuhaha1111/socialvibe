import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Create } from "./Create";

const createActivityMock = vi.fn().mockResolvedValue(undefined);

vi.mock("../context/ActivityContext", () => ({
  useActivity: () => ({
    createActivity: createActivityMock
  })
}));

describe("Create", () => {
  beforeEach(() => {
    createActivityMock.mockClear();
  });

  it("renders simplified chinese headings", () => {
    render(
      <MemoryRouter initialEntries={["/create"]}>
        <Routes>
          <Route path="/create" element={<Create />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("发布新活动")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "发布活动" })).toBeInTheDocument();
  });

  it("blocks publish when coordinates are missing", async () => {
    render(
      <MemoryRouter initialEntries={["/create"]}>
        <Routes>
          <Route path="/create" element={<Create />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("例如：周末城市漫步"), {
      target: { value: "测试活动" }
    });
    fireEvent.change(screen.getByPlaceholderText("例如：静安公园"), {
      target: { value: "静安公园" }
    });
    fireEvent.click(screen.getByRole("button", { name: "发布活动" }));

    await waitFor(() => {
      expect(screen.getByText("请先使用当前位置获取定位")).toBeInTheDocument();
    });
    expect(createActivityMock).not.toHaveBeenCalled();
  });
});
