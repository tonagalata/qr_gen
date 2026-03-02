import { Link } from 'react-router-dom'
import { Info, ArrowRight, LayoutGrid } from 'lucide-react'

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[--color-accent-soft] text-[--color-accent-strong]">
          <Info className="h-6 w-6" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            About QR Studio
          </h1>
          <p className="mt-1 text-sm text-[--color-text-muted]">
            Simple, modern QR code management
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-[--color-text-muted]">
        QR Studio is a simple, modern tool for creating and managing dynamic QR codes.
        We focus on what matters: create a code, point it to a URL, track scans, and
        change the destination anytime without reprinting.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-[--color-text-muted]">
        Whether you run menus, events, Wi‑Fi handouts, or marketing campaigns, you get
        one dashboard to organize codes, see how they perform, and download high-quality
        images for print or digital use.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-[--color-text-muted]">
        No lock-in, no complex setup. Sign up, create your first code in seconds, and
        start tracking.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link to="/signup" className="btn-primary inline-flex items-center gap-2">
          Get started
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
        <Link to="/features" className="btn-ghost inline-flex items-center gap-2">
          <LayoutGrid className="h-4 w-4" strokeWidth={2} />
          See features
        </Link>
      </div>
    </div>
  )
}
