import type { z } from 'zod';
import { AuthResponseSchema, ProblemSchema, type AuthResponse } from './schemas';

// Hand-written transport (ADR-018 fallback). ERROR_HANDLING.md §4:
// - ProblemDetails → ApiError { code, status, detail, data }
// - 401 UNAUTHENTICATED → single-flight refresh, replay once; failure → session expired
// - 401 REAUTHENTICATION_FAILED → surfaced as-is (wrong step-up password, session still valid)

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api/v1';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    public readonly detail: string,
    public readonly data: Record<string, unknown> | null = null,
    public readonly errors: Record<string, string[]> | null = null,
  ) {
    super(detail || code);
    this.name = 'ApiError';
  }
}

export function isApiError(error: unknown, code?: string): error is ApiError {
  return error instanceof ApiError && (code === undefined || error.code === code);
}

let accessToken: string | null = null;
let refreshInFlight: Promise<AuthResponse | null> | null = null;
let onSessionExpired: (() => void) | null = null;
let onSessionRefreshed: ((session: AuthResponse) => void) | null = null;

export const session = {
  set(token: string | null) {
    accessToken = token;
  },
  get hasToken() {
    return accessToken !== null;
  },
  onExpired(handler: () => void) {
    onSessionExpired = handler;
  },
  onRefreshed(handler: (session: AuthResponse) => void) {
    onSessionRefreshed = handler;
  },
};

/** Exchanges the httpOnly refresh cookie for a new access token. Single-flight across concurrent callers. */
export function refreshSession(): Promise<AuthResponse | null> {
  refreshInFlight ??= (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Guardrail-Client': 'web' },
      });
      if (!res.ok) return null;
      const auth = AuthResponseSchema.parse(await res.json());
      accessToken = auth.accessToken;
      onSessionRefreshed?.(auth);
      return auth;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

interface RequestOptions<T> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  schema?: z.ZodType<T, z.ZodTypeDef, unknown>;
  idempotencyKey?: string;
  query?: Record<string, string | number | boolean | null | undefined>;
  /** Skip the refresh-and-replay dance (auth endpoints). */
  anonymous?: boolean;
}

async function parseProblem(res: Response): Promise<ApiError> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // non-JSON error body (proxy, gateway)
  }
  const parsed = ProblemSchema.safeParse(body);
  const problem = parsed.success ? parsed.data : {};
  const fallbackCode = res.status === 401 ? 'UNAUTHENTICATED' : res.status >= 500 ? 'INTERNAL_ERROR' : 'UNKNOWN';
  return new ApiError(
    res.status,
    problem.code ?? fallbackCode,
    problem.detail ?? problem.title ?? res.statusText,
    (problem.data as Record<string, unknown> | null | undefined) ?? null,
    problem.errors ?? null,
  );
}

function buildUrl(path: string, query?: RequestOptions<unknown>['query']) {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  const qs = params.toString();
  return `${BASE_URL}${path}${qs ? `?${qs}` : ''}`;
}

async function send(path: string, options: RequestOptions<unknown>): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json', 'X-Guardrail-Client': 'web' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (accessToken && !options.anonymous) headers.Authorization = `Bearer ${accessToken}`;
  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;
  return fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    credentials: 'include',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

/** Low-level request returning status alongside the parsed body (capture needs to distinguish 200 vs 202). */
export async function requestWithStatus<T>(path: string, options: RequestOptions<T> = {}): Promise<{ status: number; data: T }> {
  let res = await send(path, options);

  if (res.status === 401 && !options.anonymous) {
    const problem = await parseProblem(res.clone());
    if (problem.code !== 'UNAUTHENTICATED') throw problem; // e.g. REAUTHENTICATION_FAILED: never refresh/logout
    const refreshed = await refreshSession();
    if (!refreshed) {
      onSessionExpired?.();
      throw problem;
    }
    res = await send(path, options);
  }

  if (!res.ok) throw await parseProblem(res);
  if (res.status === 204) return { status: res.status, data: undefined as T };

  const json: unknown = await res.json();
  const data = options.schema ? options.schema.parse(json) : (json as T);
  return { status: res.status, data };
}

export async function api<T>(path: string, options: RequestOptions<T> = {}): Promise<T> {
  return (await requestWithStatus(path, options)).data;
}

/** One key per user intent; retries of the same intent reuse it (ERROR_HANDLING.md §4). */
export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}
