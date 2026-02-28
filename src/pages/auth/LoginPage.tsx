import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password) {
      setError('Username and password are required.')
      return
    }
    setLoading(true)
    try {
      await login(username, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/80 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="brand-block flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg">
            <span className="text-lg font-semibold">QR</span>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-900">
              QuickLink
            </p>
            <p className="mt-1 text-xs text-[--color-text-muted]">
              Welcome back. Log in to manage your QR campaigns.
            </p>
          </div>
        </div>

        <div className="glass-surface px-6 py-7">
          <h1 className="text-center text-xl font-semibold tracking-tight text-slate-900">
            Welcome Back
          </h1>
          <p className="mt-1 text-center text-xs text-[--color-text-muted]">
            Please enter your details to sign in.
          </p>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
                placeholder="Your username"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium text-[--color-text-muted]"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary mt-2 w-full"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Log in'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[--color-text-muted]">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-[--color-accent] hover:underline"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
