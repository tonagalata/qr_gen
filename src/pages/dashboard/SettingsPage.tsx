import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { loadSettings, saveSettings, type UserSettings } from '../../lib/settings'

const TIMEZONES = ['UTC', 'Pacific Time (PT)', 'Eastern Time (ET)', 'Central European Time (CET)', 'Asia/Tokyo', 'Australia/Sydney']
const CURRENCIES = ['USD ($)', 'EUR (€)', 'GBP (£)', 'JPY (¥)']

export function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  function handleChange<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : null))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!settings) return
    setSaving(true)
    saveSettings(settings)
    setSaving(false)
    toast('Settings saved.')
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <div className="h-64 animate-pulse rounded-2xl bg-white/60" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="glass-surface border border-[--color-border-subtle] p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[--color-border-subtle] pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[--color-text-muted]">
              Settings
            </p>
            <p className="mt-1 text-sm text-[--color-text-muted]">
              Profile and workspace preferences. Saved in this browser.
            </p>
          </div>
          <button
            type="submit"
            form="settings-form"
            className="btn-primary h-9 rounded-xl px-4 text-xs"
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>

        <form id="settings-form" onSubmit={handleSubmit} className="mt-5 grid gap-6 md:grid-cols-[1.3fr_1fr]">
          <div className="space-y-4">
            <div>
              <label htmlFor="displayName" className="mb-1.5 block text-xs font-medium text-[--color-text-muted]">
                Display name
              </label>
              <input
                id="displayName"
                type="text"
                value={settings.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
                className="input-field"
                placeholder={user?.username ?? 'Your name'}
              />
            </div>
            <div>
              <label htmlFor="workspaceName" className="mb-1.5 block text-xs font-medium text-[--color-text-muted]">
                Workspace name
              </label>
              <input
                id="workspaceName"
                type="text"
                value={settings.workspaceName}
                onChange={(e) => handleChange('workspaceName', e.target.value)}
                className="input-field"
                placeholder="My Workspace"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="timezone" className="mb-1.5 block text-xs font-medium text-[--color-text-muted]">
                  Timezone
                </label>
                <select
                  id="timezone"
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="input-field"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="currency" className="mb-1.5 block text-xs font-medium text-[--color-text-muted]">
                  Currency
                </label>
                <select
                  id="currency"
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="input-field"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2 pt-2 text-xs text-[--color-text-muted]">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-[--color-border-subtle] text-[--color-accent] focus:ring-[--color-accent]/40"
                  checked={settings.emailWeekly}
                  onChange={(e) => handleChange('emailWeekly', e.target.checked)}
                />
                <span>Send me a weekly analytics summary email.</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-[--color-border-subtle] text-[--color-accent] focus:ring-[--color-accent]/40"
                  checked={settings.emailThreshold}
                  onChange={(e) => handleChange('emailThreshold', e.target.checked)}
                />
                <span>Notify me when a code reaches a custom threshold.</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[--color-border-subtle] bg-white/95 p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-900">Account</p>
              <p className="mt-2 text-sm text-[--color-text-muted]">
                Logged in as <strong className="text-slate-700">{user?.username}</strong>. Sign out from the header to switch accounts.
              </p>
            </div>
            <div className="rounded-2xl border border-[--color-border-subtle] bg-white/95 p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-900">Plan & usage</p>
              <p className="mt-2 text-sm text-[--color-text-muted]">
                You're on the <strong>Premium Pro</strong> plan. Usage is shown in the sidebar.
              </p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5">
              <p className="text-xs font-semibold text-rose-700">Danger zone</p>
              <p className="mt-2 text-sm text-rose-700/90">
                Deleting your account or workspace would remove all data. This is not available in-demo; use your auth provider to revoke access.
              </p>
            </div>
          </div>
        </form>
      </section>
    </div>
  )
}
