import { Link } from 'react-router-dom'
import { FileQuestion, Home, LayoutDashboard } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/80 px-4">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[--color-accent-soft] text-[--color-accent-strong]">
          <FileQuestion className="h-10 w-10" strokeWidth={1.5} />
        </div>
        <p className="mt-6 text-5xl font-bold tabular-nums text-slate-300">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">
          Page not found
        </h1>
        <p className="mt-2 max-w-sm text-sm text-[--color-text-muted]">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <Home className="h-4 w-4" strokeWidth={2} />
            Back to home
          </Link>
          <Link to="/dashboard" className="btn-ghost inline-flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" strokeWidth={2} />
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
