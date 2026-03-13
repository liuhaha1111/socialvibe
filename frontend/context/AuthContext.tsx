import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { AUTH_UNAUTHORIZED_EVENT, setAccessTokenProvider } from "../lib/api";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  verifyEmailCode: (email: string, code: string) => Promise<void>;
  resendSignupCode: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) {
          return;
        }
        if (error) {
          setSession(null);
          return;
        }
        setSession(data.session ?? null);
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      setAccessTokenProvider(null);
    };
  }, []);

  useEffect(() => {
    setAccessTokenProvider(() => session?.access_token ?? null);
  }, [session]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setSession(null);
      supabase.auth.signOut().catch(() => undefined);
    };

    if (typeof window !== "undefined") {
      window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
      }
    };
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      isLoading,
      signIn: async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw new Error(error.message);
        }
      },
      signUp: async (email: string, password: string) => {
        const emailRedirectTo =
          typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}#/auth` : undefined;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: emailRedirectTo ? { emailRedirectTo } : undefined
        });
        if (error) {
          throw new Error(error.message);
        }
      },
      verifyEmailCode: async (email: string, code: string) => {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: code.trim(),
          type: "signup"
        });
        if (error) {
          throw new Error(error.message);
        }
      },
      resendSignupCode: async (email: string) => {
        const emailRedirectTo =
          typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}#/auth` : undefined;
        const { error } = await supabase.auth.resend({
          type: "signup",
          email,
          options: emailRedirectTo ? { emailRedirectTo } : undefined
        });
        if (error) {
          throw new Error(error.message);
        }
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw new Error(error.message);
        }
        setSession(null);
      },
      getAccessToken: () => session?.access_token ?? null
    }),
    [session, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
