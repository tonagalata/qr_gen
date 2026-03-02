const BASE = '/api/auth'

export interface AuthUser {
  id: string
  username: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

export async function register(params: {
  first_name: string
  last_name: string
  username: string
  password: string
  email?: string
}): Promise<AuthResponse> {
  const { first_name, last_name, username, password, email } = params
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      username: username.trim(),
      password,
      ...(email?.trim() && { email: email.trim() }),
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data as AuthResponse
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.trim(), password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data as AuthResponse
}

const TOKEN_KEY = 'qr-gen-token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}
