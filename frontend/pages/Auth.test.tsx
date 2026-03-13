import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { Auth } from "./Auth";

const { signInMock, signUpMock, verifyEmailCodeMock, resendSignupCodeMock } = vi.hoisted(() => ({
  signInMock: vi.fn(),
  signUpMock: vi.fn(),
  verifyEmailCodeMock: vi.fn(),
  resendSignupCodeMock: vi.fn()
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    signIn: signInMock,
    signUp: signUpMock,
    verifyEmailCode: verifyEmailCodeMock,
    resendSignupCode: resendSignupCodeMock
  })
}));

describe("Auth", () => {
  beforeEach(() => {
    signInMock.mockReset();
    signUpMock.mockReset();
    verifyEmailCodeMock.mockReset();
    resendSignupCodeMock.mockReset();
  });

  it("hides email verification actions by default in sign-in mode", () => {
    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    );

    expect(screen.queryByText("Email Verification Code")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Resend Email" })).not.toBeInTheDocument();
  });

  it("shows email verification actions when sign-in fails with email not confirmed", async () => {
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
      expect(screen.getByText("Email Verification Code")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Resend Email" })).toBeInTheDocument();
  });

  it("keeps email verification actions hidden when credentials are invalid", async () => {
    signInMock.mockRejectedValue(new Error("Invalid login credentials"));

    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid login credentials")).toBeInTheDocument();
    });
    expect(screen.queryByText("Email Verification Code")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Resend Email" })).not.toBeInTheDocument();
  });
});
