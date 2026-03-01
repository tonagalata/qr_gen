import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import * as api from '../../api/codes'

const navItems = [
  { label: 'My Codes', to: '/dashboard/codes', icon: '▢' },
  { label: 'Analytics', to: '/dashboard/analytics', icon: '📈' },
  { label: 'Collections', to: '/dashboard/collections', icon: '🗂' },
  { label: 'Settings', to: '/dashboard/settings', icon: '⚙︎' },
]

const titles: Record<string, string> = {
  '/dashboard': 'My QR Codes',
  '/dashboard/codes': 'My QR Codes',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/collections': 'Collections',
  '/dashboard/settings': 'Settings',
}

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [codesCount, setCodesCount] = useState<number | null>(null)

  const pathname = location.pathname
  const pageTitle = titles[pathname] ?? 'Dashboard'

  useEffect(() => {
    if (pathname === '/dashboard/codes' || pathname === '/dashboard') {
      setSearchQuery(searchParams.get('q') ?? '')
    }
  }, [pathname, searchParams])

  useEffect(() => {
    api.listCodes().then((list) => setCodesCount(Array.isArray(list) ? list.length : 0)).catch(() => setCodesCount(0))
  }, [pathname])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) navigate(`/dashboard/codes?q=${encodeURIComponent(q)}`)
    else navigate('/dashboard/codes')
  }

  return (
    <div className="flex min-h-screen bg-[--color-bg]">
      <aside className="hidden w-60 flex-col border-r border-[--color-border-subtle] bg-white/95 px-5 py-6 shadow-sm backdrop-blur md:flex">
        <div className="flex items-center gap-2 px-1">
          <div className="brand-block flex h-9 w-9 items-center justify-center rounded-2xl shadow-lg">
            <span className="text-lg font-semibold">QR</span>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-900">
              QR Studio
            </p>
            <p className="text-[11px] text-[--color-text-muted]">Premium Pro</p>
          </div>
        </div>

        <nav className="mt-8 space-y-1 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-2 rounded-xl px-3 py-2.5 transition',
                  isActive
                    ? 'bg-[--color-accent-soft] text-[--color-accent-strong] font-medium'
                    : 'text-[--color-text-muted] hover:bg-slate-50 hover:text-[--color-text-primary]',
                ].join(' ')
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="brand-block mt-auto rounded-2xl p-4 text-xs">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] opacity-90">
            Current Plan
          </p>
          <p className="mt-1.5 text-sm font-semibold">Premium Pro</p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-white/20">
            <div
              className="h-1.5 rounded-full bg-white/70 transition-all duration-500"
              style={{ width: codesCount !== null ? `${Math.min(100, (codesCount / 1000) * 100)}%` : '75%' }}
            />
          </div>
          <p className="mt-2 text-[11px] opacity-90">
            {codesCount !== null ? `${codesCount} / 1000 codes` : '— codes'}
          </p>
        </div>
      </aside>

      <main className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[--color-border-subtle] bg-white/90 px-4 py-4 backdrop-blur md:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[--color-text-muted]">
              Dashboard
            </p>
            <h1 className="mt-0.5 text-lg font-semibold text-slate-900">
              {pageTitle}
            </h1>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <form onSubmit={handleSearchSubmit} className="hidden md:block">
              <div className="flex items-center gap-2 rounded-xl border border-[--color-border-subtle] bg-white/80 px-3 py-2 shadow-sm transition focus-within:border-[--color-accent] focus-within:ring-2 focus-within:ring-[--color-accent]/20">
                <span className="text-[--color-text-muted]" aria-hidden>🔍</span>
                <input
                  type="search"
                  placeholder="Search codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-40 border-none bg-transparent text-sm outline-none placeholder:text-[--color-text-muted] md:w-52"
                  aria-label="Search QR codes"
                />
              </div>
            </form>
            <NavLink to="/dashboard/codes" state={{ openCreate: true }} className="btn-primary hidden h-9 rounded-xl px-4 text-xs md:inline-flex">
              Create New
            </NavLink>
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-[--color-text-muted] md:inline">
                {user?.username}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-ghost h-9 rounded-xl px-3 text-xs"
              >
                Log out
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[--color-accent] text-xs font-semibold text-white shadow-md">
                {user?.username?.slice(0, 2).toUpperCase() ?? '?'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[--color-surface-soft]/60 px-4 pb-8 pt-4 md:px-8 md:pt-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
