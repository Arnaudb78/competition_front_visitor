const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)account_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((error as { message: string }).message ?? res.statusText);
  }
  return res.json() as Promise<T>;
}
