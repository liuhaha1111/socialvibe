import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { RequireAuth } from "./RequireAuth";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn()
}));

import { useAuth } from "../context/AuthContext";

describe("RequireAuth", () => {
  it("redirects unauthenticated users to /auth", () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getAccessToken: vi.fn()
    });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <RequireAuth>
                <div>private page</div>
              </RequireAuth>
            }
          />
          <Route path="/auth" element={<div>auth page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("auth page")).toBeInTheDocument();
  });
});
