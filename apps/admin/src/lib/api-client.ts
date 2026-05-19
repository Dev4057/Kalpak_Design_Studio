const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(
  path: string,
  options: RequestInit & { token: string }
): Promise<T> {
  const { token, ...init } = options
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const message = errorBody?.error?.message ?? `Request failed with status ${response.status}`
    throw new ApiError(response.status, message, errorBody?.error?.details)
  }

  return response.json() as Promise<T>
}

export const api = {
  get: <T>(path: string, token: string) =>
    apiRequest<T>(path, { method: 'GET', token }),

  post: <T>(path: string, body: unknown, token: string) =>
    apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body), token }),

  patch: <T>(path: string, body: unknown, token: string) =>
    apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(body), token }),

  delete: <T>(path: string, token: string) =>
    apiRequest<T>(path, { method: 'DELETE', token }),
}
