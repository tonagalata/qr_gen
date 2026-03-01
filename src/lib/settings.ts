const KEY = 'qr-studio-settings'

export interface UserSettings {
  displayName: string
  workspaceName: string
  timezone: string
  currency: string
  emailWeekly: boolean
  emailThreshold: boolean
}

const defaults: UserSettings = {
  displayName: '',
  workspaceName: 'QR Studio',
  timezone: 'UTC',
  currency: 'USD ($)',
  emailWeekly: true,
  emailThreshold: false,
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...defaults }
    const parsed = JSON.parse(raw) as Partial<UserSettings>
    return { ...defaults, ...parsed }
  } catch {
    return { ...defaults }
  }
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings))
}
