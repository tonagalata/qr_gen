import { getStoredToken } from './auth'

const BASE = '/api/workspace'
const BILLING = '/api/billing'

function authHeaders(extra: HeadersInit = {}): HeadersInit {
  const token = getStoredToken()
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handleRes<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error || res.statusText)
  return data as T
}

export interface WorkspaceInfo {
  id: string
  name: string
  plan: string
  code_count: number
  code_limit: number
  at_limit: boolean
  onboarding_completed_at?: string | null
}

export async function getWorkspace(): Promise<WorkspaceInfo> {
  const res = await fetch(BASE, { headers: authHeaders() })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error || res.statusText)
  return data as WorkspaceInfo
}

/** Returns workspace or null if 404 (no workspace). Use for onboarding check. */
export async function getWorkspaceOptional(): Promise<WorkspaceInfo | null> {
  const res = await fetch(BASE, { headers: authHeaders() })
  const data = await res.json().catch(() => ({}))
  if (res.status === 404 && (data as { code?: string }).code === 'NO_WORKSPACE') return null
  if (!res.ok) throw new Error((data as { error?: string }).error || res.statusText)
  return data as WorkspaceInfo
}

export async function createWorkspace(name: string): Promise<WorkspaceInfo> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name: name.trim() }),
  })
  return handleRes<WorkspaceInfo>(res)
}

export async function updateWorkspaceName(name: string): Promise<WorkspaceInfo> {
  const res = await fetch(BASE, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name: name.trim() }),
  })
  return handleRes<WorkspaceInfo>(res)
}

export async function createCheckoutSession(plan: 'pro' | 'team' = 'pro'): Promise<{ url: string }> {
  const res = await fetch(`${BILLING}/checkout`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ plan }),
  })
  const data = await handleRes<{ url: string }>(res)
  if (!data.url) throw new Error('No checkout URL returned')
  return data
}

export async function deleteWorkspace(): Promise<void> {
  const res = await fetch(BASE, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (res.status === 204) return
  const data = await res.json().catch(() => ({}))
  throw new Error((data as { error?: string }).error || res.statusText)
}

/** Mark onboarding complete if customer has payment method (fallback when webhook does not run). */
export async function confirmOnboarding(): Promise<void> {
  const res = await fetch(`${BILLING}/confirm-onboarding`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({}),
  })
  await handleRes<{ ok: boolean }>(res)
}

/** Create Stripe Checkout session for card-on-file (verification only; charged when exceeding free limit). */
export async function createBillingSetupSession(): Promise<{ url: string }> {
  const res = await fetch(`${BILLING}/setup`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({}),
  })
  const data = await handleRes<{ url: string }>(res)
  if (!data.url) throw new Error('No setup URL returned')
  return data
}

export async function createBillingPortalSession(): Promise<{ url: string }> {
  const res = await fetch(`${BILLING}/portal`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({}),
  })
  const data = await handleRes<{ url: string }>(res)
  if (!data.url) throw new Error('No portal URL returned')
  return data
}
