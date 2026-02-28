import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import type { QrCode, QrCodeCreate } from '../../types/qr'
import * as api from '../../api/codes'
import { QrCodeImage } from '../../components/QrCodeImage'

const STATUS_OPTIONS = ['active', 'paused', 'archived', 'static', 'expired'] as const
const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  paused: 'Paused',
  archived: 'Archived',
  static: 'Static',
  expired: 'Expired',
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffM = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffM / 60)
  const diffD = Math.floor(diffH / 24)
  if (diffM < 60) return `${diffM}m ago`
  if (diffH < 24) return `${diffH}h ago`
  if (diffD < 30) return `${diffD}d ago`
  return d.toLocaleDateString()
}

export function CodesOverviewPage() {
  const [codes, setCodes] = useState<QrCode[]>([])
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editCode, setEditCode] = useState<QrCode | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchCodes = async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await api.listCodes(statusFilter ?? undefined)
      setCodes(Array.isArray(list) ? list : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load codes')
      setCodes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCodes()
  }, [statusFilter])

  const handleCreate = async (body: QrCodeCreate) => {
    await api.createCode(body)
    setCreateOpen(false)
    fetchCodes()
  }

  const handleUpdate = async (id: string, body: { name?: string; subtitle?: string; target_url?: string; status?: string }) => {
    await api.updateCode(id, body)
    setEditCode(null)
    fetchCodes()
  }

  const handleDelete = async (id: string) => {
    await api.deleteCode(id)
    setDeleteId(null)
    fetchCodes()
  }

  return (
    <div className="space-y-6">
      <section className="glass-surface border border-[--color-border-subtle] p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[--color-text-muted]">
              My QR Codes
            </p>
            <p className="mt-1 text-sm text-[--color-text-muted]">
              Manage and track your active QR campaigns.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              className="btn-primary h-9 rounded-xl px-4"
              onClick={() => setCreateOpen(true)}
            >
              Create QR Code
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-b border-[--color-border-subtle] pb-2 text-xs font-medium text-[--color-text-muted]">
          <div className="flex gap-4">
            <button
              type="button"
              className={`border-b-2 pb-2 ${statusFilter === null ? 'border-[--color-accent] text-[--color-accent]' : 'border-transparent hover:text-[--color-text-primary]'}`}
              onClick={() => setStatusFilter(null)}
            >
              All Codes ({(Array.isArray(codes) ? codes : []).length})
            </button>
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className={`border-b-2 border-transparent pb-2 hover:text-[--color-text-primary] ${statusFilter === s ? 'border-[--color-accent] text-[--color-accent]' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {STATUS_LABELS[s] ?? s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 text-center text-sm text-[--color-text-muted]">Loading…</div>
        ) : (
          <div className="mt-4 space-y-3 text-xs">
            {(Array.isArray(codes) ? codes : []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[--color-border-subtle] bg-[--color-surface-soft] px-5 py-8 text-center text-[--color-text-muted]">
                No QR codes yet. Create one to get started.
              </div>
            ) : (
              (Array.isArray(codes) ? codes : []).map((code) => (
                <div
                  key={code.id}
                  className="flex flex-col gap-3 rounded-2xl border border-[--color-border-subtle] bg-white/80 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/dashboard/codes/${code.id}`}
                      className="shrink-0 rounded-lg ring-offset-2 focus-visible:ring-2 focus-visible:ring-[--color-accent]"
                      aria-label={`View ${code.name}`}
                    >
                      <QrCodeImage
                        value={code.target_url || code.subtitle || `https://example.com/q/${code.id}`}
                        size={44}
                        alt={`QR for ${code.name}`}
                      />
                    </Link>
                    <div>
                      <Link
                        to={`/dashboard/codes/${code.id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-[--color-accent] hover:underline"
                      >
                        {code.name}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-[--color-text-muted]">
                        {code.subtitle || code.target_url || '—'}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            code.status === 'active'
                              ? 'bg-emerald-50 text-emerald-600'
                              : code.status === 'static'
                                ? 'bg-slate-100 text-slate-600'
                                : code.status === 'expired'
                                  ? 'bg-rose-50 text-rose-600'
                                  : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {STATUS_LABELS[code.status] ?? code.status}
                        </span>
                        <span className="text-[11px] text-[--color-text-muted]">
                          • Created {new Date(code.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid flex-1 grid-cols-3 gap-3 text-center text-[11px] md:max-w-sm">
                    <div>
                      <p className="text-[--color-text-muted]">Total Scans</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {code.total_scans.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[--color-text-muted]">Unique Scans</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {code.unique_scans.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[--color-text-muted]">Last Scan</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatDate(code.last_scan_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 text-[15px] text-[--color-text-muted]">
                    <button
                      type="button"
                      aria-label="Download QR"
                      title="Download QR code PNG"
                      onClick={async () => {
                        const url = code.target_url || code.subtitle || `https://example.com/q/${code.id}`
                        const dataUrl = await QRCode.toDataURL(url, { width: 256, margin: 2 })
                        const a = document.createElement('a')
                        a.href = dataUrl
                        a.download = `${code.name.replace(/\s+/g, '-')}-qr.png`
                        a.click()
                      }}
                    >
                      ⬇️
                    </button>
                    <button type="button" aria-label="Edit" onClick={() => setEditCode(code)}>
                      ✎
                    </button>
                    <button type="button" aria-label="Delete" onClick={() => setDeleteId(code.id)}>
                      🗑
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-dashed border-[--color-accent-soft] bg-[--color-surface-soft] px-5 py-4 text-xs">
          <p className="font-semibold text-slate-900">Quick Tip</p>
          <p className="mt-1 text-[11px] text-[--color-text-muted]">
            Use dynamic QR codes to track scans, change URLs without reprinting, and segment
            performance by campaign.
          </p>
          <a
            href="https://docs.turso.tech"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost mt-3 inline-flex h-8 rounded-lg px-3 text-[11px]"
          >
            Learn more about dynamic codes
          </a>
        </div>
      </section>

      {createOpen && (
        <CodeFormModal
          title="Create QR Code"
          initial={{ name: '', subtitle: '', target_url: '', status: 'active' }}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
        />
      )}

      {editCode && (
        <CodeFormModal
          title="Edit QR Code"
          initial={{
            name: editCode.name,
            subtitle: editCode.subtitle,
            target_url: editCode.target_url,
            status: editCode.status,
          }}
          onClose={() => setEditCode(null)}
          onSubmit={(body) => handleUpdate(editCode.id, body)}
        />
      )}

      {deleteId && (
        <ConfirmModal
          message="Delete this QR code? This cannot be undone."
          onClose={() => setDeleteId(null)}
          onConfirm={() => handleDelete(deleteId)}
        />
      )}
    </div>
  )
}

function CodeFormModal({
  title,
  initial,
  onClose,
  onSubmit,
}: {
  title: string
  initial: { name: string; subtitle: string; target_url: string; status: string }
  onClose: () => void
  onSubmit: (body: QrCodeCreate) => void | Promise<void>
}) {
  const [name, setName] = useState(initial.name)
  const [subtitle, setSubtitle] = useState(initial.subtitle)
  const [targetUrl, setTargetUrl] = useState(initial.target_url)
  const [status, setStatus] = useState(initial.status)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSubmit({ name: name.trim(), subtitle: subtitle.trim() || undefined, target_url: targetUrl.trim() || undefined, status: status as QrCode['status'] })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="glass-surface w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[--color-text-muted]">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="e.g. Company Website"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[--color-text-muted]">Subtitle / description</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="input-field"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[--color-text-muted]">Target URL</label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="input-field"
              placeholder="https://..."
            />
          </div>
          {(targetUrl.trim() || subtitle.trim()) && (
            <div className="flex items-center gap-3 rounded-xl border border-[--color-border-subtle] bg-slate-50/50 p-3">
              <QrCodeImage
                value={targetUrl.trim() || subtitle.trim()}
                size={80}
                alt="Preview"
              />
              <p className="text-xs text-[--color-text-muted]">
                Preview: scan or download after saving.
              </p>
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-[--color-text-muted]">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-field"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving || !name.trim()}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmModal({
  message,
  onClose,
  onConfirm,
}: {
  message: string
  onClose: () => void
  onConfirm: () => void | Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="glass-surface w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-slate-900">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
