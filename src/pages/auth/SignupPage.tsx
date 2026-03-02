import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { UserPlus, Sparkles } from 'lucide-react'

export function SignupPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!firstName.trim()) {
      setError('First name is required.')
      return
    }
    if (!lastName.trim()) {
      setError('Last name is required.')
      return
    }
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
      await register({
        first_name: firstName,
        last_name: lastName,
        username,
        password,
        ...(email.trim() && { email }),
      })
      navigate('/onboarding', { replace: true })
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
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
            Teams ship QR campaigns faster with QR Studio.
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
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[--color-accent]" strokeWidth={2} />
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-[--color-text-muted]">
                    QR STUDIO
                  </p>
                  <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900">
                    Create account
                  </h1>
                </div>
              </div>
              <p className="mt-1 text-xs text-[--color-text-muted]">
                Enter your name and choose a username to get started.
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="first-name"
                  className="mb-1.5 block text-xs font-medium text-[--color-text-muted]"
                >
                  First name
                </label>
                <input
                  id="first-name"
                  type="text"
                  placeholder="First name"
                  className="input-field"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label
                  htmlFor="last-name"
                  className="mb-1.5 block text-xs font-medium text-[--color-text-muted]"
                >
                  Last name
                </label>
                <input
                  id="last-name"
                  type="text"
                  placeholder="Last name"
                  className="input-field"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-[--color-text-muted]"
              >
                Email <span className="text-[--color-text-muted]/70">(optional)</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
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
