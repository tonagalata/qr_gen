export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <section className="glass-surface border border-[--color-border-subtle] p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[--color-text-muted]">
              Analytics
            </p>
            <p className="mt-1 text-sm text-[--color-text-muted]">
              See how your QR codes perform over time.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button className="btn-ghost h-8 rounded-xl px-3">
              Last 7 days
            </button>
            <button className="btn-ghost h-8 rounded-xl px-3">
              Last 30 days
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-[--color-border-subtle]">
            <p className="text-[11px] font-medium text-[--color-text-muted]">
              Total Scans
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              18,560
            </p>
            <p className="mt-1 text-[11px] text-emerald-600">
              ↑ 24% vs last period
            </p>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-[--color-border-subtle]">
            <p className="text-[11px] font-medium text-[--color-text-muted]">
              Unique Visitors
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              11,204
            </p>
            <p className="mt-1 text-[11px] text-emerald-600">
              ↑ 12% vs last period
            </p>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-[--color-border-subtle]">
            <p className="text-[11px] font-medium text-[--color-text-muted]">
              Top Device
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              iOS · 64%
            </p>
            <p className="mt-1 text-[11px] text-[--color-text-muted]">
              Followed by Android at 31%.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-[--color-border-subtle]">
            <div className="flex items-center justify-between text-xs">
              <p className="font-medium text-slate-900">Scans over time</p>
              <p className="text-[--color-text-muted]">Daily · Last 30 days</p>
            </div>
            <div className="mt-4 h-40 rounded-xl bg-gradient-to-t from-[#eef2ff] via-white to-white">
              <div className="flex h-full items-end gap-1 px-3 pb-3">
                {Array.from({ length: 20 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-full bg-indigo-200"
                    style={{
                      height: `${20 + ((index * 13) % 70)}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-[--color-border-subtle]">
              <p className="text-xs font-medium text-slate-900">
                Top Locations
              </p>
              <div className="mt-3 space-y-2 text-[11px] text-[--color-text-muted]">
                {[
                  { name: 'United States', value: '54%' },
                  { name: 'Germany', value: '18%' },
                  { name: 'Brazil', value: '12%' },
                  { name: 'Japan', value: '7%' },
                ].map((loc) => (
                  <div
                    key={loc.name}
                    className="flex items-center justify-between"
                  >
                    <span>{loc.name}</span>
                    <span className="font-medium text-slate-900">
                      {loc.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-[--color-border-subtle]">
              <p className="text-xs font-medium text-slate-900">
                Top performing codes
              </p>
              <div className="mt-3 space-y-1.5 text-[11px] text-[--color-text-muted]">
                <p>
                  <span className="font-medium text-slate-900">
                    Portfolio Website
                  </span>{' '}
                  · 8,120 scans
                </p>
                <p>
                  <span className="font-medium text-slate-900">
                    Summer Sale Menu
                  </span>{' '}
                  · 5,304 scans
                </p>
                <p>
                  <span className="font-medium text-slate-900">
                    Office Guest WiFi
                  </span>{' '}
                  · 2,140 scans
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

