import { Link } from 'react-router-dom'
import { Check, CreditCard, ChevronRight } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for trying out dynamic QR codes',
    price: 'Free',
    period: 'forever',
    features: ['Up to 10 QR codes', 'Scan tracking', 'Unlimited redirects', 'Basic analytics'],
    cta: 'Get started',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    description: 'For individuals and small teams',
    price: '$12',
    period: '/month',
    features: ['Up to 1,000 QR codes', 'Unique scan tracking', 'Collections & organization', 'Download PNG/SVG', 'Priority support'],
    cta: 'Start free trial',
    href: '/signup',
    highlighted: true,
  },
  {
    name: 'Team',
    description: 'For growing organizations',
    price: '$29',
    period: '/month',
    features: ['Unlimited QR codes', 'Team workspaces', 'Custom branding', 'API access', 'Dedicated support'],
    cta: 'Contact sales',
    href: '/signup',
    highlighted: false,
  },
]

export function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[--color-accent-soft] text-[--color-accent-strong]">
          <CreditCard className="h-6 w-6" strokeWidth={2} />
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-3 max-w-xl mx-auto text-sm text-[--color-text-muted]">
          Start free. Upgrade when you need more codes and features.
        </p>
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-3xl border p-6 shadow-sm ${
              plan.highlighted
                ? 'border-[--color-accent] bg-white ring-2 ring-[--color-accent]/20'
                : 'border-[--color-border-subtle] bg-white/90'
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[--color-accent] px-3 py-0.5 text-xs font-medium text-white">
                Most popular
              </span>
            )}
            <h2 className="text-lg font-semibold text-slate-900">{plan.name}</h2>
            <p className="mt-1 text-sm text-[--color-text-muted]">{plan.description}</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
              <span className="text-sm text-[--color-text-muted]">{plan.period}</span>
            </div>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-[--color-text-muted]">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to={plan.href}
              className={`mt-6 flex w-full items-center justify-center gap-2 ${plan.highlighted ? 'btn-primary' : 'btn-ghost'}`}
            >
              {plan.cta}
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
