import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import type { QrCode } from '../../types/qr'
import * as api from '../../api/codes'
import { QrCodeImage } from '../../components/QrCodeImage'
import { getScanUrl, getShortUrl } from '../../lib/scanUrl'

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
  const [copied, setCopied] = useState(false)
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    const dataUrl = await QRCode.toDataURL(getScanUrl(code.id), { width: 512, margin: 2 })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${code.name.replace(/\s+/g, '-')}-qr.png`
    a.click()
  }

  const qrValue = code ? getScanUrl(code.id) : ''

  const handleCopyShortLink = (shortUrl: string) => {
    navigator.clipboard.writeText(shortUrl).then(() => {
      setCopied(true)
      if (copyTimeout.current) clearTimeout(copyTimeout.current)
      copyTimeout.current = setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-6 w-32 animate-pulse rounded-lg bg-white/60 sm:h-8 sm:w-48" />
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          <div className="mx-auto h-56 w-56 shrink-0 animate-pulse rounded-2xl bg-white/60 sm:h-72 sm:w-72" />
          <div className="min-w-0 flex-1 space-y-3 sm:space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-xl bg-white/60 sm:h-12" />
            ))}
          </div>
        </div>
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
    <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
      <Link
        to="/dashboard/codes"
        className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-[--color-text-muted] hover:text-[--color-text-primary] sm:min-h-0 sm:text-xs"
        aria-label="Back to codes"
      >
        ← Back to codes
      </Link>

      <section className="glass-surface overflow-hidden rounded-2xl border border-[--color-border-subtle] shadow-sm sm:rounded-3xl">
        {/* QR + title block — stacks on mobile */}
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-6 sm:p-6 md:p-8">
          <div className="flex flex-col items-center gap-3 sm:shrink-0">
            <div className="w-full max-w-[min(100vw-2rem,280px)] rounded-2xl border border-[--color-border-subtle] bg-white p-3 shadow-sm sm:max-w-none sm:w-auto sm:p-4">
              <QrCodeImage
                value={qrValue}
                size={QR_SIZE}
                alt={`QR code for ${code.name}`}
                className="h-auto max-w-full w-full"
              />
            </div>
            <button
              type="button"
              className="btn-primary w-full min-h-[44px] rounded-xl px-4 text-sm font-medium sm:w-auto sm:min-h-0 sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-xs"
              onClick={handleDownload}
            >
              Download PNG
            </button>
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <h1 className="text-lg font-semibold leading-tight text-slate-900 sm:text-xl">
                {code.name}
              </h1>
              {(code.subtitle || code.target_url) && (
                <p className="mt-1.5 line-clamp-2 break-words text-sm text-[--color-text-muted]">
                  {code.subtitle || code.target_url}
                </p>
              )}
              {code.target_url && (
                <p className="mt-1.5 text-xs text-[--color-text-muted]">
                  <span className="block text-[11px] uppercase tracking-wider opacity-80">Redirects to</span>
                  <a
                    href={code.target_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 block break-all text-[--color-accent] hover:underline"
                  >
                    {code.target_url}
                  </a>
                </p>
              )}
              <span
                className={`mt-3 inline-block rounded-full px-3 py-1.5 text-xs font-medium ${
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

            {/* Stats grid — 3 cols on desktop, 2x2 or stacked on small */}
            <dl className="grid grid-cols-2 gap-3 rounded-xl border border-[--color-border-subtle] bg-white/60 p-4 sm:grid-cols-3 sm:gap-4">
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wider text-[--color-text-muted] sm:text-xs">
                  Total scans
                </dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-slate-900 sm:text-lg">
                  {code.total_scans.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wider text-[--color-text-muted] sm:text-xs">
                  Unique scans
                </dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-slate-900 sm:text-lg">
                  {code.unique_scans.toLocaleString()}
                </dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-[11px] font-medium uppercase tracking-wider text-[--color-text-muted] sm:text-xs">
                  Created
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">
                  {new Date(code.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </dd>
              </div>
            </dl>

            {code.short_slug && (() => {
              const shortUrl = getShortUrl(code.short_slug)
              return (
                <div className="rounded-xl border border-[--color-border-subtle] bg-white p-4">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.15em] text-[--color-text-muted]">
                    Short link
                  </p>
                  <div className="flex min-h-[44px] flex-col gap-2 sm:min-h-0 sm:flex-row sm:items-center sm:gap-2">
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 flex-1 break-all text-sm font-medium text-[--color-accent] hover:underline"
                    >
                      {shortUrl}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyShortLink(shortUrl)}
                      className="btn-ghost min-h-[44px] shrink-0 rounded-xl px-4 py-2.5 text-sm sm:min-h-0 sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-xs"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </section>
    </div>
  )
}
