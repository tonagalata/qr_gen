export function SettingsPage() {
  return (
    <div className="space-y-6">
      <section className="glass-surface border border-[--color-border-subtle] p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[--color-border-subtle] pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[--color-text-muted]">
              Settings
            </p>
            <p className="mt-1 text-sm text-[--color-text-muted]">
              Manage your profile, team, and workspace preferences.
            </p>
          </div>
          <button className="btn-primary h-9 rounded-xl px-4 text-xs">
            Save Changes
          </button>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <form className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-xs font-medium text-[--color-text-muted]"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                defaultValue="Admin User"
                className="input-field"
              />
            </div>
            <div>
              <label
                htmlFor="workspace"
                className="mb-1.5 block text-xs font-medium text-[--color-text-muted]"
              >
                Workspace Name
              </label>
              <input
                id="workspace"
                type="text"
                defaultValue="QR Studio – Premium Plan"
                className="input-field"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="timezone"
                  className="mb-1.5 block text-xs font-medium text-[--color-text-muted]"
                >
                  Timezone
                </label>
                <select id="timezone" className="input-field">
                  <option>UTC</option>
                  <option>Pacific Time (PT)</option>
                  <option>Eastern Time (ET)</option>
                  <option>Central European Time (CET)</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="currency"
                  className="mb-1.5 block text-xs font-medium text-[--color-text-muted]"
                >
                  Default Currency
                </label>
                <select id="currency" className="input-field">
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-[--color-text-muted]">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-[--color-border-subtle] text-[--color-accent] focus:ring-[--color-accent]/40"
                  defaultChecked
                />
                <span>Send me a weekly analytics summary email.</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-[--color-border-subtle] text-[--color-accent] focus:ring-[--color-accent]/40"
                />
                <span>Notify me when a code reaches a custom threshold.</span>
              </label>
            </div>
          </form>

          <div className="space-y-4 text-xs text-[--color-text-muted]">
            <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-[--color-border-subtle]">
              <p className="text-xs font-semibold text-slate-900">
                Plan & Usage
              </p>
              <p className="mt-2">
                You&apos;re on the <strong>Premium Pro</strong> plan with{' '}
                <strong>1,000</strong> codes included.
              </p>
              <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100">
                <div className="h-1.5 w-3/4 rounded-full bg-violet-500" />
              </div>
              <p className="mt-2 text-[11px]">750 / 1000 codes used</p>
              <button className="btn-ghost mt-3 h-8 rounded-lg px-3 text-[11px]">
                Manage billing
              </button>
            </div>

            <div className="rounded-2xl bg-rose-50/80 p-4 ring-1 ring-rose-100">
              <p className="text-xs font-semibold text-rose-700">
                Danger zone
              </p>
              <p className="mt-2">
                Deleting your workspace will permanently remove all QR codes,
                analytics, and team members.
              </p>
              <button className="mt-3 inline-flex items-center rounded-lg border border-rose-300 px-3 py-1.5 text-[11px] font-medium text-rose-700 hover:bg-rose-100">
                Delete workspace
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

