import { useEffect, useState, useMemo } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import QRCode from 'qrcode'
import type { QrCode, QrCodeCreate, QrCodeUpdate } from '../../types/qr'
import * as api from '../../api/codes'
import * as workspaceApi from '../../api/workspace'
import { QrCodeImage } from '../../components/QrCodeImage'
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal'
import { loadCollections, setCodeCollection } from '../../lib/collections'
import { getScanUrl } from '../../lib/scanUrl'

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
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const [codes, setCodes] = useState<QrCode[]>([])
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editCode, setEditCode] = useState<QrCode | null>(null)
  const [codeToDelete, setCodeToDelete] = useState<QrCode | null>(null)
  const [collectionsTick, setCollectionsTick] = useState(0)
  const [workspace, setWorkspace] = useState<workspaceApi.WorkspaceInfo | null>(null)
  const atLimit = workspace?.at_limit ?? false
  const isFreePlan = workspace?.plan === 'free'
  const canEditCode = (c: QrCode) => !isFreePlan && (c.total_scans ?? 0) === 0
  const canDeleteCode = () => !isFreePlan

  const searchQ = searchParams.get('q') ?? ''
  const collections = useMemo(() => loadCollections(), [collectionsTick])

  const filteredCodes = useMemo(() => {
    const list = Array.isArray(codes) ? codes : []
    if (!searchQ.trim()) return list
    const q = searchQ.trim().toLowerCase()
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
        (c.target_url && c.target_url.toLowerCase().includes(q))
    )
  }, [codes, searchQ])

  useEffect(() => {
    if (location.state && (location.state as { openCreate?: boolean }).openCreate && !atLimit) {
      setCreateOpen(true)
      window.history.replaceState({}, '', location.pathname + location.search)
    }
  }, [location.state, location.pathname, location.search, atLimit])

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

  useEffect(() => {
    workspaceApi.getWorkspace().then(setWorkspace).catch(() => setWorkspace(null))
  }, [])

  const handleCreate = async (body: QrCodeCreate) => {
    await api.createCode(body)
    setCreateOpen(false)
    fetchCodes()
    if (workspace) setWorkspace((w) => (w ? { ...w, code_count: w.code_count + 1, at_limit: w.code_count + 1 >= w.code_limit } : w))
  }

  const handleUpdate = async (id: string, body: QrCodeUpdate) => {
    await api.updateCode(id, body)
    setEditCode(null)
    fetchCodes()
  }

  const handleDelete = async (id: string) => {
    await api.deleteCode(id)
    setCodeToDelete(null)
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
            {atLimit ? (
              <Link
                to="/dashboard/settings"
                className="inline-flex h-9 items-center rounded-xl bg-amber-100 px-4 font-medium text-amber-800 hover:bg-amber-200"
              >
                Upgrade to add more codes
              </Link>
            ) : (
              <button
                type="button"
                className="btn-primary h-9 rounded-xl px-4"
                onClick={() => setCreateOpen(true)}
              >
                Create QR Code
              </button>
            )}
          </div>
        </div>

        {isFreePlan && (
          <p className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-2 text-xs text-amber-800">
            Free plan: new codes count toward your 5-code limit. Codes cannot be edited or deleted. Upgrade in Settings for more.
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-b border-[--color-border-subtle] pb-2 text-xs font-medium text-[--color-text-muted]">
          <div className="flex gap-4">
            <button
              type="button"
              className={`border-b-2 pb-2 ${statusFilter === null ? 'border-[--color-accent] text-[--color-accent]' : 'border-transparent hover:text-[--color-text-primary]'}`}
              onClick={() => setStatusFilter(null)}
            >
              All Codes ({filteredCodes.length})
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

        {searchQ && (
          <p className="mt-3 text-xs text-[--color-text-muted]">
            Showing results for “{searchQ}”. <button type="button" className="font-medium text-[--color-accent] hover:underline" onClick={() => setSearchParams({})}>Clear search</button>
          </p>
        )}

        {loading ? (
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/60" />
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-3 text-xs">
            {filteredCodes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[--color-border-subtle] bg-[--color-surface-soft] px-5 py-12 text-center">
                <p className="text-sm font-medium text-slate-900">
                  {searchQ ? 'No codes match your search.' : 'No QR codes yet.'}
                </p>
                <p className="mt-1 text-[--color-text-muted]">
                  {searchQ ? 'Try a different query or clear search.' : atLimit ? 'Upgrade your plan to create more codes.' : 'Create one to get started.'}
                </p>
                {!searchQ && !atLimit && (
                  <button type="button" className="btn-primary mt-4" onClick={() => setCreateOpen(true)}>
                    Create QR Code
                  </button>
                )}
                {!searchQ && atLimit && (
                  <Link to="/dashboard/settings" className="btn-primary mt-4 inline-block">
                    Upgrade to add more codes
                  </Link>
                )}
              </div>
            ) : (
              filteredCodes.map((code) => (
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
                        value={getScanUrl(code.id)}
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
                      <div className="mt-2 flex flex-wrap items-center gap-2">
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
                        {collections.codeToCollection[code.id] && (
                          <span className="rounded-full bg-[--color-accent-soft] px-2 py-0.5 text-[11px] font-medium text-[--color-accent-strong]">
                            {collections.codeToCollection[code.id]}
                          </span>
                        )}
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

                  <div className="flex flex-wrap items-center justify-end gap-2 text-[15px] text-[--color-text-muted]">
                    <select
                      className="rounded-lg border border-[--color-border-subtle] bg-white/80 px-2 py-1 text-[11px] text-slate-700"
                      value={collections.codeToCollection[code.id] ?? ''}
                      onChange={(e) => {
                        const v = e.target.value
                        setCodeCollection(code.id, v || null)
                        setCollectionsTick((t) => t + 1)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Collection"
                    >
                      <option value="">No collection</option>
                      {collections.names.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      aria-label="Download QR"
                      title="Download QR code PNG"
                      onClick={async () => {
                        const dataUrl = await QRCode.toDataURL(getScanUrl(code.id), { width: 256, margin: 2 })
                        const a = document.createElement('a')
                        a.href = dataUrl
                        a.download = `${code.name.replace(/\s+/g, '-')}-qr.png`
                        a.click()
                      }}
                    >
                      ⬇️
                    </button>
                    <button
                      type="button"
                      aria-label="Edit"
                      title={
                        isFreePlan
                          ? 'Editing is not available on the free plan'
                          : (code.total_scans ?? 0) > 0
                            ? 'Codes cannot be edited after they have been scanned'
                            : 'Edit'
                      }
                      disabled={!canEditCode(code)}
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => canEditCode(code) && setEditCode(code)}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      aria-label="Delete"
                      title={isFreePlan ? 'Deleting is not available on the free plan' : 'Delete'}
                      disabled={!canDeleteCode()}
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => canDeleteCode() && setCodeToDelete(code)}
                    >
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
          <Link
            to="/learn"
            className="btn-ghost mt-3 inline-flex h-8 rounded-lg px-3 text-[11px]"
          >
            Learn more about dynamic codes
          </Link>
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

      {codeToDelete && (
        <DeleteConfirmModal
          resourceType="QR code"
          resourceName={codeToDelete.name}
          confirmText="delete"
          onClose={() => setCodeToDelete(null)}
          onConfirm={() => handleDelete(codeToDelete.id)}
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

