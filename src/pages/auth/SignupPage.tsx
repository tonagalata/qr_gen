import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function SignupPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!username.trim()) {
      setError('Username is required.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await register(username, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/80 px-4 py-10">
      <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
        <div className="hidden flex-col gap-4 lg:flex">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-[--color-text-muted] shadow-sm ring-1 ring-[--color-border-subtle]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Teams ship QR campaigns 4x faster with QR Studio.
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Create once, update anytime.
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-[--color-text-muted]">
            Join modern teams using dynamic QR codes to power menus, events,
            packaging, and more. No engineering ticket required.
          </p>
        </div>

        <div className="glass-surface px-6 py-7">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[--color-text-muted]">
                QUICKLINK
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                Create Account
              </h1>
              <p className="mt-1 text-xs text-[--color-text-muted]">
                Choose a username and password to get started.
              </p>
            </div>
            <Link
              to="/login"
              className="text-xs font-medium text-[--color-accent] hover:underline"
            >
              Log in
            </Link>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-xs font-medium text-[--color-text-muted]"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Choose a username"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="mb-1.5 block text-xs font-medium text-[--color-text-muted]"
              >
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                placeholder="At least 6 characters"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1.5 block text-xs font-medium text-[--color-text-muted]"
              >
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Repeat password"
                className="input-field"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[--color-text-muted]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-[--color-accent] hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
