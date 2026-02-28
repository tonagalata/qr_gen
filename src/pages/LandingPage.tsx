import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/80">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="brand-block flex h-9 w-9 items-center justify-center rounded-2xl shadow-lg">
            <span className="text-lg font-semibold">QR</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              QR Studio
            </span>
            <span className="text-xs font-medium text-[--color-text-muted]">
              Dynamic QR Campaigns
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[--color-text-muted] md:flex">
          <a href="#features" className="hover:text-[--color-text-primary]">
            Features
          </a>
          <a href="#analytics" className="hover:text-[--color-text-primary]">
            Analytics
          </a>
          <a href="#pricing" className="hover:text-[--color-text-primary]">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden text-sm font-medium text-[--color-text-muted] hover:text-[--color-text-primary] md:inline"
          >
            Log in
          </Link>
          <Link to="/signup" className="btn-primary text-sm">
            Get started
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 pb-16 pt-10 lg:flex-row lg:items-center lg:px-8 lg:pt-14">
        <section className="flex-1">
          <span className="badge-soft mb-4 inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Realtime scan analytics
          </span>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Create, track, and manage QR codes in one place.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[--color-text-muted] sm:text-base">
            Launch beautiful QR campaigns for menus, Wi‑Fi, print, and social in
            seconds. Update destinations anytime without reprinting and see
            exactly how every scan performs.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/signup" className="btn-primary text-sm">
              Start free trial
            </Link>
            <Link to="/login" className="btn-ghost text-sm">
              View dashboard
            </Link>
          </div>
          <div className="mt-6 flex items-center gap-4 text-xs text-[--color-text-muted]">
            <div className="flex -space-x-2">
              <div className="h-7 w-7 rounded-full border border-white bg-gradient-to-tr from-violet-500 to-indigo-500" />
              <div className="h-7 w-7 rounded-full border border-white bg-gradient-to-tr from-sky-500 to-cyan-400" />
              <div className="h-7 w-7 rounded-full border border-white bg-gradient-to-tr from-fuchsia-500 to-rose-500" />
            </div>
            <p>
              Loved by teams creating over{' '}
              <span className="font-semibold text-slate-900">50k+</span> QR
              codes every month.
            </p>
          </div>
        </section>

        <section
          aria-label="Dashboard preview"
          className="relative mt-6 flex flex-1 justify-center lg:mt-0"
        >
          <div className="glass-surface relative w-full max-w-md p-5">
            <div className="flex items-center justify-between border-b border-[--color-border-subtle] pb-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[--color-text-muted]">
                  My QR Codes
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  All Codes · 24 Active
                </p>
              </div>
              <button className="btn-primary h-9 rounded-lg px-3 text-xs font-semibold shadow-md">
                Create QR Code
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              {['Company Website', 'Summer Sale Menu', 'Guest WiFi', 'Profile'].map(
                (label, index) => (
                  <div
                    key={label}
                    className="flex flex-col rounded-2xl border border-[--color-border-subtle] bg-[--color-surface] p-3 shadow-sm"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          index === 0
                            ? 'bg-indigo-500/10 text-indigo-600'
                            : index === 1
                              ? 'bg-violet-500/10 text-violet-600'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <div className="h-5 w-5 rounded-[5px] border-2 border-current" />
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                        Active
                      </span>
                    </div>
                    <p className="truncate text-xs font-semibold text-slate-900">
                      {label}
                    </p>
                    <p className="mt-1 text-[11px] text-[--color-text-muted]">
                      Created{' '}
                      {index === 0 ? 'Oct 24, 2023' : 'Oct 20, 2023'}
                    </p>
                  </div>
                ),
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-[--color-accent-soft] bg-[--color-surface-soft] px-5 py-4 text-xs">
              <p className="font-semibold text-slate-900">Need another one?</p>
              <p className="mt-1 text-[11px] text-[--color-text-muted]">
                Create dynamic QR codes for menus, events, Wi‑Fi, and more —
                all managed from a single dashboard.
              </p>
              <button className="btn-ghost mt-3 h-8 rounded-lg px-3 text-[11px]">
                Quick Create
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

