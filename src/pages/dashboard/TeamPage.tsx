import { Users } from 'lucide-react'

export function TeamPage() {
  return (
    <div className="space-y-6">
      <section className="glass-surface border border-[--color-border-subtle] p-4 md:p-5">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[--color-accent]" strokeWidth={2} />
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[--color-text-muted]">
              Team
            </p>
            <h2 className="mt-0.5 text-lg font-semibold text-slate-900">
              Workspace members
            </h2>
          </div>
        </div>
        <p className="mt-4 text-sm text-[--color-text-muted]">
          Manage who has access to this workspace. Invite members and assign roles (owner, admin, member).
        </p>
        <div className="mt-6 rounded-2xl border border-dashed border-[--color-border-subtle] bg-[--color-surface-soft] px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">Team management coming soon</p>
          <p className="mt-1 text-xs text-[--color-text-muted]">
            You’ll be able to invite teammates and manage roles from here.
          </p>
        </div>
      </section>
    </div>
  )
}
