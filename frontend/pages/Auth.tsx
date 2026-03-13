import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function isEmailNotConfirmed(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  return normalized.includes("email not confirmed") || normalized.includes("email_not_confirmed");
}

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, verifyEmailCode, resendSignupCode } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCodeSubmitting, setIsCodeSubmitting] = useState(false);
  const [showVerificationActions, setShowVerificationActions] = useState(false);

  const submitLabel = mode === "signin" ? "Sign In" : "Sign Up";
  const switchLabel = mode === "signin" ? "Create account" : "Have an account? Sign in";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        await signIn(email, password);
        setShowVerificationActions(false);
        navigate("/", { replace: true });
      } else {
        await signUp(email, password);
        setMode("signin");
        setPassword("");
        setShowVerificationActions(true);
        setNotice("Registration successful. Please check your email to verify your account, then sign in.");
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message.trim() : "";
      if (mode === "signin" && isEmailNotConfirmed(message)) {
        setShowVerificationActions(true);
      }
      if (!message || message === "{}" || message === "[object Object]") {
        setError(mode === "signup" ? "Registration failed. Please try again." : "Sign in failed. Please try again.");
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!email.trim() || !code.trim()) {
      setError("Please enter email and verification code.");
      return;
    }

    setError(null);
    setNotice(null);
    setIsCodeSubmitting(true);
    try {
      await verifyEmailCode(email.trim(), code.trim());
      setShowVerificationActions(false);
      setNotice("Email verified. You can now sign in with email and password.");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message.trim() : "";
      setError(message || "Failed to verify code. Please try again.");
    } finally {
      setIsCodeSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!email.trim()) {
      setError("Please enter your email first.");
      return;
    }

    setError(null);
    setNotice(null);
    setIsCodeSubmitting(true);
    try {
      await resendSignupCode(email.trim());
      setNotice("If your account still requires verification, a new verification email has been sent.");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message.trim() : "";
      setError(message || "Failed to resend verification email.");
    } finally {
      setIsCodeSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white min-h-screen px-6 py-12">
        <h1 className="text-2xl font-bold text-slate-900">{mode === "signin" ? "Welcome back" : "Create account"}</h1>
        <p className="text-sm text-slate-500 mt-2">Use your email and password to continue.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="auth-email">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>

          {mode === "signin" && showVerificationActions ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="auth-code">
                Email Verification Code
              </label>
              <input
                id="auth-code"
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                placeholder="Enter code from email"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={isCodeSubmitting}
                  className="flex-1 rounded-xl border border-slate-300 text-slate-700 py-2 font-medium disabled:opacity-70"
                >
                  Verify Code
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isCodeSubmitting}
                  className="flex-1 rounded-xl border border-slate-300 text-slate-700 py-2 font-medium disabled:opacity-70"
                >
                  Resend Email
                </button>
              </div>
            </div>
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {notice ? <p className="text-sm text-emerald-700">{notice}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary text-white py-3 font-semibold disabled:opacity-70"
          >
            {isSubmitting ? "Please wait..." : submitLabel}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((prev) => (prev === "signin" ? "signup" : "signin"));
            setError(null);
            setNotice(null);
            setCode("");
            setShowVerificationActions(false);
          }}
          className="mt-4 text-sm text-primary font-medium"
        >
          {switchLabel}
        </button>
      </div>
    </div>
  );
};
