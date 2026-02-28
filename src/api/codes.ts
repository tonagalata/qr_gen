import type { QrCode, QrCodeCreate, QrCodeUpdate } from '../types/qr'
import { getStoredToken } from './auth'

const BASE = '/api/codes'

function authHeaders(extra: HeadersInit = {}): HeadersInit {
  const token = getStoredToken()
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handleRes<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data as T
}

export async function listCodes(status?: string): Promise<QrCode[]> {
  const url = status ? `${BASE}?status=${encodeURIComponent(status)}` : BASE
  const res = await fetch(url, { headers: authHeaders() })
  const data = await handleRes<QrCode[] | unknown>(res)
  return Array.isArray(data) ? data : []
}

export async function getCode(id: string): Promise<QrCode> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, { headers: authHeaders() })
  return handleRes<QrCode>(res)
}

export async function createCode(body: QrCodeCreate): Promise<QrCode> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  })
  return handleRes<QrCode>(res)
}

export async function updateCode(id: string, body: QrCodeUpdate): Promise<QrCode> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  })
  return handleRes<QrCode>(res)
}

export async function deleteCode(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  await handleRes<void>(res)
}
