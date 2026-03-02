import { Link } from 'react-router-dom'
import { QrCode, RefreshCw, BarChart3, UserPlus, Share2, Plus, ChevronRight, Sparkles } from 'lucide-react'

const features = [
  {
    title: 'Create & track',
    description: 'Generate QR codes for any URL. Every scan is counted and timestamped so you see real performance.',
    icon: QrCode,
  },
  {
    title: 'Update anytime',
    description: 'Change where a code points without reprinting. Printed codes keep working while you edit the destination.',
    icon: RefreshCw,
  },
  {
    title: 'Analytics',
    description: 'Total scans, unique visitors, and last scan time per code. Filter by period and see top performers.',
    icon: BarChart3,
  },
]

const steps = [
  { step: 1, title: 'Sign up', body: 'Create a free account in seconds.', icon: UserPlus },
  { step: 2, title: 'Create a code', body: 'Add a name and target URL, then download the QR image.', icon: QrCode },
  { step: 3, title: 'Share or print', body: 'Use the same link everywhere—we track scans and redirect users.', icon: Share2 },
]

export function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pt-12 pb-20 sm:px-6 sm:pt-16 lg:px-8 lg:pt-24 lg:pb-28">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
            <div className="max-w-xl">
              <span className="badge-soft mb-4 inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
                Scan tracking included
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Create, track, and manage QR codes in one place
              </h1>
              <p className="mt-5 text-base leading-relaxed text-[--color-text-muted] sm:text-lg">
                Launch QR campaigns for menus, Wi‑Fi, events, and marketing in seconds.
                Update destinations anytime without reprinting and see how every scan performs.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to="/signup" className="btn-primary px-6 py-3 text-base">
                  Start free
                </Link>
                <Link to="/login" className="btn-ghost px-6 py-3 text-base">
                  Log in
                </Link>
              </div>
              <p className="mt-6 text-xs text-[--color-text-muted]">
                No credit card required. Free tier includes 10 codes and full tracking.
              </p>
            </div>
            <div className="relative flex-1 lg:flex lg:justify-center">
              <div className="glass-surface w-full max-w-md p-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-[--color-border-subtle] pb-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[--color-text-muted]">
                      Dashboard
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      My QR Codes · 24 Active
                    </p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Live
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {['Menu', 'Wi‑Fi', 'Event', 'Profile'].map((label) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 rounded-xl border border-[--color-border-subtle] bg-white p-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[--color-accent-soft] text-[--color-accent-strong]">
                        <QrCode className="h-5 w-5" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-900">{label}</p>
                        <p className="text-[10px] text-[--color-text-muted]">Active</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-dashed border-[--color-accent-soft] bg-[--color-surface-soft]/50 px-4 py-3 text-xs text-[--color-text-muted]">
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  Create new code
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-[--color-border-subtle]/60 bg-white/50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Everything you need
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[--color-text-muted]">
            From creation to analytics, no extra tools required.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-[--color-border-subtle] bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[--color-accent-soft] text-[--color-accent-strong]">
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm text-[--color-text-muted]">{f.description}</p>
              </div>
            )
          })}
          </div>
          <div className="mt-10 text-center">
            <Link to="/features" className="inline-flex items-center gap-1 text-sm font-medium text-[--color-accent] hover:underline">
              See all features
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[--color-border-subtle]/60 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            How it works
          </h2>
          <div className="mt-12 flex flex-col gap-8 sm:flex-row sm:justify-between">
            {steps.map(({ step, title, body, icon: StepIcon }) => (
              <div key={step} className="flex flex-col items-center text-center sm:flex-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[--color-accent] text-white shadow-lg shadow-[--color-accent]/30">
                  <StepIcon className="h-7 w-7" strokeWidth={2} />
                </div>
                <span className="mt-4 text-xs font-medium uppercase tracking-wider text-[--color-text-muted]">Step {step}</span>
                <h3 className="mt-1 font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm text-[--color-text-muted]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section id="pricing" className="border-t border-[--color-border-subtle]/60 bg-white/50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Simple pricing
          </h2>
          <p className="mt-3 text-sm text-[--color-text-muted]">
            Start free. Upgrade when you need more codes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/signup" className="btn-primary px-6 py-3 text-base">
              Get started free
            </Link>
            <Link to="/pricing" className="btn-ghost px-6 py-3 text-base">
              View plans
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-t border-[--color-border-subtle]/60 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-[--color-text-muted]">
            Trusted by teams creating QR campaigns for menus, events, and marketing.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 text-[--color-text-muted]">
            <div className="flex -space-x-2">
              <div className="h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br from-violet-500 to-indigo-500" />
              <div className="h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br from-sky-500 to-cyan-400" />
              <div className="h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br from-fuchsia-500 to-rose-500" />
            </div>
            <span className="text-xs font-medium text-slate-600">
              Join others building with QR Studio
            </span>
          </div>
        </div>
      </section>
    </>
  )
}
