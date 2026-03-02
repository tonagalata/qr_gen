import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { loadSettings, saveSettings, type UserSettings } from '../../lib/settings'
import * as workspaceApi from '../../api/workspace'
import type { WorkspaceInfo } from '../../api/workspace'
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal'
import { clearStoredToken } from '../../api/auth'

const TIMEZONES = ['UTC', 'Pacific Time (PT)', 'Eastern Time (ET)', 'Central European Time (CET)', 'Asia/Tokyo', 'Australia/Sydney']
const CURRENCIES = ['USD ($)', 'EUR (€)', 'GBP (£)', 'JPY (¥)']

export function SettingsPage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null)
  const [workspaceNameInput, setWorkspaceNameInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [workspaceSaving, setWorkspaceSaving] = useState(false)
  const [billingLoading, setBillingLoading] = useState<'checkout' | 'portal' | null>(null)
  const [showDeleteWorkspaceModal, setShowDeleteWorkspaceModal] = useState(false)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  useEffect(() => {
    workspaceApi.getWorkspace().then(setWorkspace).catch(() => setWorkspace(null))
  }, [])

  useEffect(() => {
    if (workspace) setWorkspaceNameInput(workspace.name)
  }, [workspace?.name])

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

  async function handleWorkspaceNameSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = workspaceNameInput.trim()
    if (!name || !workspace) return
    setWorkspaceSaving(true)
    try {
      const updated = await workspaceApi.updateWorkspaceName(name)
      setWorkspace(updated)
      toast('Workspace name updated.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update workspace name.')
    } finally {
      setWorkspaceSaving(false)
    }
  }

  async function handleUpgrade(plan: 'pro' | 'team' = 'pro') {
    setBillingLoading('checkout')
    try {
      const { url } = await workspaceApi.createCheckoutSession(plan)
      window.location.href = url
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to start checkout.')
      setBillingLoading(null)
    }
  }

  async function handleManageBilling() {
    setBillingLoading('portal')
    try {
      const { url } = await workspaceApi.createBillingPortalSession()
      window.location.href = url
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to open billing portal.')
      setBillingLoading(null)
    }
  }

  async function handleDeleteWorkspace() {
    try {
      await workspaceApi.deleteWorkspace()
      setShowDeleteWorkspaceModal(false)
      clearStoredToken()
      logout()
      toast('Workspace deleted.')
      navigate('/login', { replace: true })
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to delete workspace.')
      throw err
    }
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
                First Name
              </label>
              <input
                id="displayName"
                type="text"
                value={settings.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="input-field"
                placeholder={user?.username ?? ([user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Your name')}
              />
            </div>
            <div>
              <label htmlFor="displayName" className="mb-1.5 block text-xs font-medium text-[--color-text-muted]">
                Last Name
              </label>
              <input
                id="displayName"
                type="text"
                value={settings.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="input-field"
                placeholder="Your last name"
              />
            </div>
            <div>
              <label htmlFor="workspaceName" className="mb-1.5 block text-xs font-medium text-[--color-text-muted]">
                Workspace name
              </label>
              <form onSubmit={handleWorkspaceNameSubmit} className="flex gap-2">
                <input
                  id="workspaceName"
                  type="text"
                  value={workspaceNameInput}
                  onChange={(e) => setWorkspaceNameInput(e.target.value)}
                  className="input-field flex-1"
                  placeholder="My Workspace"
                  disabled={!workspace}
                />
                <button
                  type="submit"
                  className="btn-primary h-10 rounded-xl px-4 text-xs"
                  disabled={workspaceSaving || !workspace || workspaceNameInput.trim() === workspace?.name}
                >
                  {workspaceSaving ? 'Saving…' : 'Save'}
                </button>
              </form>
              <p className="mt-1 text-[11px] text-[--color-text-muted]">
                This workspace is shared with your team (see Team page).
              </p>
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
              <p className="text-xs font-semibold text-slate-900">Plan & billing</p>
              {workspace ? (
                <>
                  <p className="mt-2 text-sm text-[--color-text-muted]">
                    Plan:{' '}
                    <strong className="capitalize text-slate-700">
                      {workspace.plan === 'free'
                        ? 'Starter'
                        : workspace.plan === 'pro'
                          ? 'Pro'
                          : 'Team'}
                    </strong>
                    {' · '}
                    <strong>{workspace.code_count}</strong>
                    {' / '}
                    <strong>
                      {workspace.plan === 'team'
                        ? 'Unlimited'
                        : workspace.code_limit.toLocaleString()}
                    </strong>{' '}
                    codes
                  </p>
                  {workspace.plan === 'free' ? (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-medium text-slate-700">Subscribe for more codes</p>
                      <p className="text-[11px] text-[--color-text-muted]">
                        Pro or Team — enter your card and you’re set.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-xl border border-[--color-border-subtle] bg-white px-4 py-2.5 text-xs font-medium shadow-sm hover:border-indigo-300 hover:bg-indigo-50/50 disabled:opacity-50"
                          disabled={!!billingLoading}
                          onClick={() => handleUpgrade('pro')}
                        >
                          Pro (1,000 codes)
                        </button>
                        <button
                          type="button"
                          className="rounded-xl border border-[--color-border-subtle] bg-white px-4 py-2.5 text-xs font-medium shadow-sm hover:border-indigo-300 hover:bg-indigo-50/50 disabled:opacity-50"
                          disabled={!!billingLoading}
                          onClick={() => handleUpgrade('team')}
                        >
                          Team (Unlimited codes)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-[11px] text-[--color-text-muted]">
                      Change plan or update your card in the billing portal below.
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-[--color-border-subtle] pt-3">
                    <button
                      type="button"
                      className="btn-ghost h-8 rounded-lg px-3 text-xs"
                      disabled={!!billingLoading}
                      onClick={handleManageBilling}
                    >
                      {billingLoading === 'portal' ? 'Opening…' : 'Manage billing & update card'}
                    </button>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm text-[--color-text-muted]">Loading…</p>
              )}
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5">
              <p className="text-xs font-semibold text-rose-700">Danger zone</p>
              <p className="mt-2 text-sm text-rose-700/90">
                Deleting your workspace will permanently remove all QR codes and data in it. This cannot be undone.
              </p>
              {workspace && (
                <button
                  type="button"
                  className="mt-3 rounded-xl border border-rose-400 bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600"
                  onClick={() => setShowDeleteWorkspaceModal(true)}
                >
                  Delete workspace
                </button>
              )}
            </div>
          </div>
        </form>
      </section>

      {showDeleteWorkspaceModal && workspace && (
        <DeleteConfirmModal
          resourceType="workspace"
          resourceName={workspace.name}
          confirmText="delete"
          onClose={() => setShowDeleteWorkspaceModal(false)}
          onConfirm={handleDeleteWorkspace}
        />
      )}
    </div>
  )
}
