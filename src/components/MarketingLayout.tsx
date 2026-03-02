import { Link, Outlet } from 'react-router-dom'
import { LayoutGrid, CreditCard, Info, HelpCircle, BookOpen, LogIn, ChevronRight } from 'lucide-react'

const navLinks = [
  { label: 'Features', to: '/features', icon: LayoutGrid },
  { label: 'Pricing', to: '/pricing', icon: CreditCard },
  { label: 'Learn', to: '/learn', icon: BookOpen },
  { label: 'About', to: '/about', icon: Info },
  { label: 'FAQ', to: '/faq', icon: HelpCircle },
]

const footerLinks = [
  { label: 'Features', to: '/features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Learn', to: '/learn' },
  { label: 'About', to: '/about' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Log in', to: '/login' },
  { label: 'Sign up', to: '/signup' },
]

export function MarketingLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50/95 via-white to-violet-50/90">
      <header className="sticky top-0 z-20 border-b border-[--color-border-subtle]/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="brand-block flex h-9 w-9 items-center justify-center rounded-xl shadow-lg">
              <LayoutGrid className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              QR Studio
            </span>
          </Link>
          <nav className="hidden items-center gap-0.5 md:flex">
            {navLinks.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[--color-text-muted] transition hover:bg-slate-100 hover:text-[--color-text-primary]"
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[--color-text-muted] transition hover:text-[--color-text-primary]"
            >
              <LogIn className="h-4 w-4" strokeWidth={2} />
              Log in
            </Link>
            <Link to="/signup" className="btn-primary flex items-center gap-2 rounded-xl px-4 py-2 text-sm">
              Get started
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[--color-border-subtle]/60 bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="brand-block flex h-8 w-8 items-center justify-center rounded-xl">
                <LayoutGrid className="h-4 w-4" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold text-slate-900">QR Studio</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              {footerLinks.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="font-medium text-[--color-text-muted] transition hover:text-[--color-accent]"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <p className="mt-8 text-center text-xs text-[--color-text-muted]">
            © {new Date().getFullYear()} QR Studio. Create, track, and manage QR campaigns.
          </p>
        </div>
      </footer>
    </div>
  )
}
