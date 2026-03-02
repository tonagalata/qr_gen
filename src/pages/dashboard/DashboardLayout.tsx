import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import * as api from '../../api/codes'
import * as workspaceApi from '../../api/workspace'
import { QrCode, BarChart3, FolderOpen, Settings, LayoutGrid, Search, Plus, LogOut, CreditCard, Users } from 'lucide-react'

const navItems = [
  { label: 'My Codes', to: '/dashboard/codes', icon: QrCode },
  { label: 'Analytics', to: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Collections', to: '/dashboard/collections', icon: FolderOpen },
  { label: 'Team', to: '/dashboard/team', icon: Users },
  { label: 'Settings', to: '/dashboard/settings', icon: Settings },
]

const titles: Record<string, string> = {
  '/dashboard': 'My QR Codes',
  '/dashboard/codes': 'My QR Codes',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/collections': 'Collections',
  '/dashboard/team': 'Team',
  '/dashboard/settings': 'Settings',
}

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [codesCount, setCodesCount] = useState<number | null>(null)
  const [workspace, setWorkspace] = useState<workspaceApi.WorkspaceInfo | null>(null)

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

  useEffect(() => {
    workspaceApi
      .getWorkspaceOptional()
      .then((ws) => {
        if (!ws) {
          navigate('/onboarding', { replace: true })
          return
        }
        if (!ws.onboarding_completed_at) {
          navigate('/onboarding', { replace: true })
          return
        }
        setWorkspace(ws)
      })
      .catch(() => setWorkspace(null))
  }, [pathname, navigate])

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
            <LayoutGrid className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-900">
              QR Studio
            </p>
            <p className="text-[11px] text-[--color-text-muted] capitalize">{workspace?.plan ?? '—'}</p>
          </div>
        </div>

        <nav className="mt-8 space-y-1 text-sm">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition',
                    isActive
                      ? 'bg-[--color-accent-soft] text-[--color-accent-strong] font-medium'
                      : 'text-[--color-text-muted] hover:bg-slate-50 hover:text-[--color-text-primary]',
                  ].join(' ')
                }
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="brand-block mt-auto rounded-2xl p-4 text-xs">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 opacity-90" strokeWidth={2} />
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] opacity-90">
              Current Plan
            </p>
          </div>
          <p className="mt-1.5 text-sm font-semibold">
            {workspace?.plan === 'free'
              ? 'Starter'
              : workspace?.plan === 'pro'
                ? 'Pro'
                : workspace?.plan === 'team'
                  ? 'Team'
                  : '—'}
          </p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-white/20">
            <div
              className="h-1.5 rounded-full bg-white/70 transition-all duration-500"
              style={{
                width:
                  workspace && workspace.code_limit > 0
                    ? `${Math.min(100, (workspace.code_count / workspace.code_limit) * 100)}%`
                    : '0%',
              }}
            />
          </div>
          <p className="mt-2 text-[11px] opacity-90">
            {workspace != null
              ? workspace.plan === 'team'
                ? `${workspace.code_count} / Unlimited codes`
                : `${workspace.code_count} / ${workspace.code_limit} codes`
              : codesCount !== null
                ? `${codesCount} codes`
                : '— codes'}
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
                <Search className="h-4 w-4 shrink-0 text-[--color-text-muted]" strokeWidth={2} aria-hidden />
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
            {workspace?.at_limit ? (
              <NavLink
                to="/dashboard/settings"
                className="btn-ghost hidden h-9 items-center gap-2 rounded-xl px-4 text-xs md:inline-flex text-amber-700 hover:bg-amber-50"
              >
                Upgrade to add more codes
              </NavLink>
            ) : (
              <NavLink to="/dashboard/codes" state={{ openCreate: true }} className="btn-primary hidden h-9 items-center gap-2 rounded-xl px-4 text-xs md:inline-flex">
                <Plus className="h-4 w-4" strokeWidth={2} />
                Create New
              </NavLink>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLogout}
                className="btn-ghost flex h-9 items-center gap-2 rounded-xl px-3 text-xs"
              >
                <LogOut className="h-4 w-4" strokeWidth={2} />
                Log out
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[--color-accent] border border-[--color-border-subtle] text-xs font-semibold shadow-md">
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
