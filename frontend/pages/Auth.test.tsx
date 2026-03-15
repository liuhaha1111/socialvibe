import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Auth } from "./Auth";

const { signInMock, signUpMock } = vi.hoisted(() => ({
  signInMock: vi.fn(),
  signUpMock: vi.fn()
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    signIn: signInMock,
    signUp: signUpMock
  })
}));

describe("Auth", () => {
  beforeEach(() => {
    signInMock.mockReset();
    signUpMock.mockReset();
  });

  it("does not render email verification UI in sign-in mode", () => {
    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    );

    expect(screen.queryByText("Email Verification Code")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Verify Code" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Resend Email" })).not.toBeInTheDocument();
  });

  it("keeps email verification UI hidden even when sign-in fails", async () => {
    signInMock.mockRejectedValue(new Error("Email not confirmed"));

    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Email not confirmed")).toBeInTheDocument();
    });
    expect(screen.queryByText("Email Verification Code")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Resend Email" })).not.toBeInTheDocument();
  });

  it("signs up without showing verification instructions", async () => {
    signUpMock.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith("new@example.com", "password123");
    });

    expect(screen.getByText("Registration successful. Please sign in.")).toBeInTheDocument();
    expect(screen.queryByText("Email Verification Code")).not.toBeInTheDocument();
  });
});
