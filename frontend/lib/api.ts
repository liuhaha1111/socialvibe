interface ApiEnvelope<T> {
  code: string;
  message: string;
  data: T;
}

import { supabase } from "./supabase";

export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";

type AccessTokenProvider = (() => string | null | Promise<string | null>) | null;

let accessTokenProvider: AccessTokenProvider = null;

export function setAccessTokenProvider(provider: AccessTokenProvider): void {
  accessTokenProvider = provider;
}

async function resolveAccessToken(): Promise<string | null> {
  const fromProvider = accessTokenProvider ? await accessTokenProvider() : null;
  if (fromProvider) {
    return fromProvider;
  }

  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await resolveAccessToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (res.status === 204) {
    return null as T;
  }

  const body = (await res.json()) as Partial<ApiEnvelope<T>>;
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    }
    throw new Error(body.message ?? "Request failed");
  }

  return body.data as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path);
}

export function apiPost<T>(path: string, payload?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    body: payload ? JSON.stringify(payload) : undefined
  });
}

export function apiPut<T>(path: string, payload: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function apiDelete(path: string): Promise<null> {
  return apiRequest<null>(path, {
    method: "DELETE"
  });
}
