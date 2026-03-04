interface ApiEnvelope<T> {
  code: string;
  message: string;
  data: T;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (res.status === 204) {
    return null as T;
  }

  const body = (await res.json()) as Partial<ApiEnvelope<T>>;
  if (!res.ok) {
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
