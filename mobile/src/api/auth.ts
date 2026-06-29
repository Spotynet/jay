import type { User } from '../types/user';
import { getApiUrl } from './config';

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

export interface AuthTokens {
  access: string;
  refresh: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: Record<string, unknown>,
  ) {
    super(formatApiErrorMessage(body));
    this.name = 'ApiError';
  }
}

export function formatApiErrorMessage(body: Record<string, unknown>): string {
  const detail = body.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(String).join('\n');
  const parts: string[] = [];
  for (const [key, value] of Object.entries(body)) {
    if (Array.isArray(value)) parts.push(`${key}: ${value.join(', ')}`);
    else if (typeof value === 'object' && value !== null) {
      parts.push(`${key}: ${JSON.stringify(value)}`);
    } else if (value !== undefined) {
      parts.push(`${key}: ${String(value)}`);
    }
  }
  return parts.join('\n') || 'Request failed';
}

async function parseJsonResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { detail: text || `HTTP ${res.status}` };
  }
}

export async function registerAccount(
  email: string,
  password: string,
  passwordConfirm: string,
): Promise<{ user: User } & AuthTokens> {
  const res = await fetch(`${getApiUrl()}/api/users/register/`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
      password_confirm: passwordConfirm,
    }),
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) throw new ApiError(res.status, data);
  return data as unknown as { user: User } & AuthTokens;
}

/** Login uses Django username field; we store email as username on registration. */
export async function loginWithPassword(
  email: string,
  password: string,
): Promise<{ user: User } & AuthTokens> {
  const res = await fetch(`${getApiUrl()}/api/users/token/`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      username: email.trim().toLowerCase(),
      password,
    }),
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) throw new ApiError(res.status, data);
  return data as unknown as { user: User } & AuthTokens;
}

export async function fetchCurrentUser(accessToken: string): Promise<User> {
  const res = await fetch(`${getApiUrl()}/api/users/me/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) throw new ApiError(res.status, data);
  return data as unknown as User;
}

/** Returns new access (and refresh if rotated). */
export async function refreshAccessToken(refreshToken: string): Promise<AuthTokens | null> {
  const res = await fetch(`${getApiUrl()}/api/users/token/refresh/`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ refresh: refreshToken }),
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) return null;
  const access = data.access as string | undefined;
  if (!access) return null;
  const refresh = (data.refresh as string | undefined) ?? refreshToken;
  return { access, refresh };
}
