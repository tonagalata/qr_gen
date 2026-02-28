import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import type { QrCode } from '../../types/qr'
import * as api from '../../api/codes'
import { QrCodeImage } from '../../components/QrCodeImage'

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  paused: 'Paused',
  archived: 'Archived',
  static: 'Static',
  expired: 'Expired',
}

const QR_SIZE = 320

export function CodeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [code, setCode] = useState<QrCode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)
    api
      .getCode(id)
      .then((c) => {
        if (!cancelled) setCode(c)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const handleDownload = async () => {
    if (!code) return
    const url = code.target_url || code.subtitle || `https://example.com/q/${code.id}`
    const dataUrl = await QRCode.toDataURL(url, { width: 512, margin: 2 })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${code.name.replace(/\s+/g, '-')}-qr.png`
    a.click()
  }

  const qrValue = code
    ? code.target_url || code.subtitle || `https://example.com/q/${code.id}`
    : ''

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[--color-text-muted]">
        Loading…
      </div>
    )
  }

  if (error || !code) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error ?? 'QR code not found'}
        </p>
        <Link to="/dashboard/codes" className="btn-ghost text-sm">
          ← Back to codes
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to="/dashboard/codes"
        className="inline-flex items-center gap-1 text-xs font-medium text-[--color-text-muted] hover:text-[--color-text-primary]"
      >
        ← Back to codes
      </Link>

      <section className="glass-surface border border-[--color-border-subtle] p-6 md:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="shrink-0 rounded-2xl border border-[--color-border-subtle] bg-white p-4 shadow-sm">
            <QrCodeImage
              value={qrValue}
              size={QR_SIZE}
              alt={`QR code for ${code.name}`}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{code.name}</h1>
              {(code.subtitle || code.target_url) && (
                <p className="mt-1 text-sm text-[--color-text-muted]">
                  {code.subtitle || code.target_url}
                </p>
              )}
              <span
                className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
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
            </div>

            <dl className="grid gap-2 text-sm">
              <div>
                <dt className="text-[--color-text-muted]">Total scans</dt>
                <dd className="font-semibold text-slate-900">{code.total_scans.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-[--color-text-muted]">Unique scans</dt>
                <dd className="font-semibold text-slate-900">{code.unique_scans.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-[--color-text-muted]">Created</dt>
                <dd className="font-medium text-slate-900">
                  {new Date(code.created_at).toLocaleString()}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                className="btn-primary"
                onClick={handleDownload}
              >
                Download PNG (512×512)
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
