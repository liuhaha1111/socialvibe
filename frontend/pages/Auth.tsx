import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        navigate("/", { replace: true });
      } else {
        await signUp(email, password);
        setMode("signin");
        setPassword("");
        setNotice("Registration successful. Please sign in.");
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message.trim() : "";
      if (!message || message === "{}" || message === "[object Object]") {
        setError(mode === "signup" ? "Registration failed. Please try again." : "Sign in failed. Please try again.");
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
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
          }}
          className="mt-4 text-sm text-primary font-medium"
        >
          {switchLabel}
        </button>
      </div>
    </div>
  );
};
