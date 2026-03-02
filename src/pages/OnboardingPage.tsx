import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import * as workspaceApi from '../api/workspace'
import {
  LayoutGrid,
  Users,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from 'lucide-react'

const STEPS = ['workspace', 'team', 'plan', 'card'] as const
type Step = (typeof STEPS)[number]

export function OnboardingPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const stepParam = searchParams.get('step')
  const [step, setStep] = useState<Step>(
    stepParam && (STEPS as readonly string[]).includes(stepParam)
      ? (stepParam as Step)
      : 'workspace',
  )
  const [workspace, setWorkspace] = useState<workspaceApi.WorkspaceInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    workspaceApi
      .getWorkspaceOptional()
      .then((ws) => {
        setWorkspace(ws ?? null)
        if (!ws) {
          setStep('workspace')
        } else if (ws.onboarding_completed_at) {
          navigate('/dashboard', { replace: true })
        } else if (stepParam !== 'complete') {
          setStep(stepParam && STEPS.includes(stepParam as Step) ? (stepParam as Step) : 'team')
          if (!stepParam || !STEPS.includes(stepParam as Step)) setSearchParams({ step: 'team' })
        }
      })
      .catch(() => setWorkspace(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (stepParam !== 'complete') return
    let cancelled = false
    let pollCount = 0
    const check = () => {
      workspaceApi.getWorkspace().then((ws) => {
        if (cancelled) return
        setWorkspace(ws)
        if (ws.onboarding_completed_at) {
          toast('Setup complete. Welcome!')
          navigate('/dashboard', { replace: true })
          return
        }
        pollCount += 1
        if (pollCount === 3) {
          workspaceApi.confirmOnboarding().then(() => {
            if (cancelled) return
            toast('Setup complete. Welcome!')
            navigate('/dashboard', { replace: true })
          }).catch(() => {})
        }
      }).catch(() => {})
    }
    check()
    const t = setInterval(check, 2000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [stepParam, navigate, toast])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/80">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (searchParams.get('step') === 'complete') {
    return (
      <CompleteStep
        onConfirm={async () => {
          try {
            await workspaceApi.confirmOnboarding()
            toast('Setup complete. Welcome!')
            navigate('/dashboard', { replace: true })
          } catch (err) {
            toast(err instanceof Error ? err.message : 'No card on file yet. Add a card first.')
          }
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/80 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 flex items-center gap-2">
          <LayoutGrid className="h-8 w-8 text-indigo-600" strokeWidth={2} />
          <span className="text-lg font-semibold text-slate-900">QR Studio</span>
        </div>

        <div className="mb-8 flex gap-2">
          {STEPS.map((s) => {
            const idx = STEPS.indexOf(step)
            const done = workspace && (s === 'workspace' || (s === 'team' && idx > 0) || (s === 'plan' && idx > 1) || (s === 'card' && idx > 2))
            const active = step === s
            return (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full ${
                  active ? 'bg-indigo-500' : done ? 'bg-indigo-300' : 'bg-slate-200'
                }`}
              />
            )
          })}
        </div>

        {step === 'workspace' && (
          <StepCreateWorkspace
            onSuccess={(ws) => {
              setWorkspace(ws)
              setStep('team')
              setSearchParams({ step: 'team' })
            }}
            submitting={submitting}
            setSubmitting={setSubmitting}
          />
        )}

        {step === 'team' && (
          <StepTeam
            onNext={() => {
              setStep('plan')
              setSearchParams({ step: 'plan' })
            }}
          />
        )}

        {step === 'plan' && (
          <StepPlan
            onNext={() => {
              setStep('card')
              setSearchParams({ step: 'card' })
            }}
          />
        )}

        {step === 'card' && (
          <StepCard
            submitting={submitting}
            setSubmitting={setSubmitting}
          />
        )}
      </div>
    </div>
  )
}

function CompleteStep({ onConfirm }: { onConfirm: () => void | Promise<void> }) {
  const [loading, setLoading] = useState(false)
  const handleClick = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/80 px-4">
      <CheckCircle2 className="h-12 w-12 text-indigo-500" strokeWidth={2} />
      <p className="mt-4 text-lg font-medium text-slate-900">Completing setup…</p>
      <p className="mt-1 text-sm text-[--color-text-muted]">You’ll be redirected in a moment.</p>
      <Loader2 className="mt-6 h-8 w-8 animate-spin text-indigo-500" />
      <button
        type="button"
        className="btn-primary mt-8"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "I've added my card, take me to dashboard"}
      </button>
    </div>
  )
}

function StepCreateWorkspace({
  onSuccess,
  submitting,
  setSubmitting,
}: {
  onSuccess: (ws: workspaceApi.WorkspaceInfo) => void
  submitting: boolean
  setSubmitting: (v: boolean) => void
}) {
  const [name, setName] = useState('')
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setSubmitting(true)
    try {
      const ws = await workspaceApi.createWorkspace(trimmed)
      onSuccess(ws)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to create workspace')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="glass-surface rounded-2xl border border-[--color-border-subtle] p-6">
      <h1 className="text-xl font-semibold text-slate-900">Create your workspace</h1>
      <p className="mt-1 text-sm text-[--color-text-muted]">
        Give your workspace a name. You can change it later in settings.
      </p>
      <form onSubmit={handleSubmit} className="mt-6">
        <label className="mb-1.5 block text-xs font-medium text-[--color-text-muted]">
          Workspace name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field w-full"
          placeholder="e.g. Acme Inc"
          autoFocus
        />
        <button
          type="submit"
          className="btn-primary mt-4 flex w-full items-center justify-center gap-2"
          disabled={submitting || !name.trim()}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Continue
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}

function StepTeam({ onNext }: { onNext: () => void }) {
  return (
    <div className="glass-surface rounded-2xl border border-[--color-border-subtle] p-6">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-indigo-600" strokeWidth={2} />
        <h1 className="text-xl font-semibold text-slate-900">Add your team</h1>
      </div>
      <p className="mt-1 text-sm text-[--color-text-muted]">
        Invite teammates to collaborate on QR codes. You can do this later from the Team page.
      </p>
      <div className="mt-6 flex gap-3">
        <button type="button" className="btn-ghost flex-1" onClick={onNext}>
          Skip for now
        </button>
        <button type="button" className="btn-primary flex-1" onClick={onNext}>
          Continue
        </button>
      </div>
    </div>
  )
}

function StepPlan({ onNext }: { onNext: () => void }) {
  return (
    <div className="glass-surface rounded-2xl border border-[--color-border-subtle] p-6">
      <h1 className="text-xl font-semibold text-slate-900">Choose your plan</h1>
      <p className="mt-1 text-sm text-[--color-text-muted]">
        Start free with 10 codes. Upgrade anytime for more.
      </p>
      <div className="mt-6 grid gap-3">
        {[
          { id: 'free', name: 'Free', codes: '10 codes', desc: 'Try it out' },
          { id: 'pro', name: 'Pro', codes: '1,000 codes', desc: 'For growing teams' },
          { id: 'team', name: 'Team', codes: 'Unlimited codes', desc: 'For large orgs' },
        ].map((p) => (
          <button
            key={p.id}
            type="button"
            className="flex items-center justify-between rounded-xl border border-[--color-border-subtle] bg-white/80 p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50"
            onClick={onNext}
          >
            <div>
              <p className="font-medium text-slate-900">{p.name}</p>
              <p className="text-xs text-[--color-text-muted]">{p.codes} · {p.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        ))}
      </div>
    </div>
  )
}

function StepCard({
  submitting,
  setSubmitting,
}: {
  submitting: boolean
  setSubmitting: (v: boolean) => void
}) {
  const { toast } = useToast()

  async function handleAddCard() {
    setSubmitting(true)
    try {
      const { url } = await workspaceApi.createBillingSetupSession()
      window.location.href = url
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to open setup')
      setSubmitting(false)
    }
  }

  return (
    <div className="glass-surface rounded-2xl border border-[--color-border-subtle] p-6">
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-indigo-600" strokeWidth={2} />
        <h1 className="text-xl font-semibold text-slate-900">Add a card on file</h1>
      </div>
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900">
        <p className="font-medium">Verification only — you won&apos;t be charged yet.</p>
        <p className="mt-1 text-amber-800/90">
          Your card is used to verify your account. You will only be charged when you exceed the
          free limit (e.g. create more than 10 codes or upgrade to Pro/Team).
        </p>
      </div>
      <button
        type="button"
        className="btn-primary mt-6 flex w-full items-center justify-center gap-2"
        onClick={handleAddCard}
        disabled={submitting}
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            Add card
          </>
        )}
      </button>
    </div>
  )
}
