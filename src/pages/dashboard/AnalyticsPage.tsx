import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { QrCode } from '../../types/qr'
import * as api from '../../api/codes'

type Period = '7' | '30' | 'all'

export function AnalyticsPage() {
  const [codes, setCodes] = useState<QrCode[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('30')

  useEffect(() => {
    api.listCodes().then((list) => setCodes(Array.isArray(list) ? list : [])).catch(() => setCodes([])).finally(() => setLoading(false))
  }, [])

  const { totals, topCodes, chartData, periodLabel } = useMemo(() => {
    const now = Date.now()
    const periodMs = period === '7' ? 7 * 24 * 60 * 60 * 1000 : period === '30' ? 30 * 24 * 60 * 60 * 1000 : Infinity
    const inRange = (code: QrCode) => {
      if (period === 'all') return true
      const last = code.last_scan_at ? new Date(code.last_scan_at).getTime() : 0
      return last >= now - periodMs || code.total_scans > 0
    }
    const filtered = codes.filter(inRange)
    const totalScans = filtered.reduce((s, c) => s + c.total_scans, 0)
    const uniqueScans = filtered.reduce((s, c) => s + c.unique_scans, 0)
    const top = [...filtered].sort((a, b) => b.total_scans - a.total_scans).slice(0, 5)
    const forChart = [...filtered].sort((a, b) => b.total_scans - a.total_scans).slice(0, 12)
    const maxScans = Math.max(1, ...forChart.map((c) => c.total_scans))
    const label = period === '7' ? 'Last 7 days' : period === '30' ? 'Last 30 days' : 'All time'
    return {
      totals: { totalScans, uniqueScans },
      topCodes: top,
      chartData: forChart.map((c) => ({ ...c, barPct: (c.total_scans / maxScans) * 100 })),
      periodLabel: label,
    }
  }, [codes, period])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-white/60" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/60" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="glass-surface border border-[--color-border-subtle] p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[--color-text-muted]">
              Analytics
            </p>
            <p className="mt-1 text-sm text-[--color-text-muted]">
              Performance across your QR codes.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {(['7', '30', 'all'] as const).map((p) => (
              <button
                key={p}
                type="button"
                className={`rounded-xl px-3 py-2 font-medium transition ${
                  period === p ? 'btn-primary' : 'btn-ghost'
                }`}
                onClick={() => setPeriod(p)}
              >
                {p === 'all' ? 'All time' : `Last ${p} days`}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[--color-border-subtle] bg-white/95 p-5 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[--color-text-muted]">
              Total Scans
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
              {totals.totalScans.toLocaleString()}
            </p>
            <p className="mt-1 text-[11px] text-[--color-text-muted]">{periodLabel}</p>
          </div>
          <div className="rounded-2xl border border-[--color-border-subtle] bg-white/95 p-5 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[--color-text-muted]">
              Unique Scans
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
              {totals.uniqueScans.toLocaleString()}
            </p>
            <p className="mt-1 text-[11px] text-[--color-text-muted]">{periodLabel}</p>
          </div>
          <div className="rounded-2xl border border-[--color-border-subtle] bg-white/95 p-5 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[--color-text-muted]">
              Active Codes
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
              {codes.filter((c) => c.status === 'active').length}
            </p>
            <p className="mt-1 text-[11px] text-[--color-text-muted]">of {codes.length} total</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-[--color-border-subtle] bg-white/95 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Scans by code</p>
            <p className="mt-0.5 text-[11px] text-[--color-text-muted]">Top 12 · {periodLabel}</p>
            <div className="mt-4 space-y-3">
              {chartData.length === 0 ? (
                <p className="py-8 text-center text-sm text-[--color-text-muted]">No scan data in this period.</p>
              ) : (
                chartData.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-32 shrink-0 truncate text-[11px] font-medium text-slate-700">
                      {item.name}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="h-6 w-full overflow-hidden rounded-lg bg-slate-100">
                        <div
                          className="h-full rounded-lg bg-[--color-accent] transition-all duration-500"
                          style={{ width: `${item.barPct}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-14 shrink-0 text-right text-[11px] font-medium tabular-nums text-slate-700">
                      {item.total_scans.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-[--color-border-subtle] bg-white/95 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Top performing codes</p>
              <p className="mt-0.5 text-[11px] text-[--color-text-muted]">{periodLabel}</p>
              <div className="mt-4 space-y-2">
                {topCodes.length === 0 ? (
                  <p className="text-[11px] text-[--color-text-muted]">No data yet.</p>
                ) : (
                  topCodes.map((code) => (
                    <Link
                      key={code.id}
                      to={`/dashboard/codes/${code.id}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2 transition hover:bg-slate-50"
                    >
                      <span className="text-[11px] font-medium text-slate-900">{code.name}</span>
                      <span className="text-[11px] tabular-nums text-[--color-text-muted]">
                        {code.total_scans.toLocaleString()} scans
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-dashed border-[--color-accent-soft] bg-[--color-surface-soft]/50 p-4">
              <p className="text-xs font-semibold text-slate-900">Tip</p>
              <p className="mt-1 text-[11px] text-[--color-text-muted]">
                Share your QR codes to start seeing scans. Data updates as scans are recorded.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
