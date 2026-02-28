import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { AuthUser } from '../api/auth'
import {
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  login as apiLogin,
  register as apiRegister,
} from '../api/auth'

interface AuthState {
  user: AuthUser | null
  token: string | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: getStoredToken(),
    loading: true,
  })

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setState((s) => ({ ...s, loading: false, token: null, user: null }))
      return
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1] ?? ''))
      const exp = payload.exp
      if (exp && exp * 1000 < Date.now()) {
        clearStoredToken()
        setState((s) => ({ ...s, loading: false, token: null, user: null }))
        return
      }
      setState((s) => ({
        ...s,
        loading: false,
        user: { id: payload.sub, username: payload.username ?? '' },
      }))
    } catch {
      clearStoredToken()
      setState((s) => ({ ...s, loading: false, token: null, user: null }))
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const { user, token } = await apiLogin(username, password)
    setStoredToken(token)
    setState({ user, token, loading: false })
  }, [])

  const register = useCallback(async (username: string, password: string) => {
    const { user, token } = await apiRegister(username, password)
    setStoredToken(token)
    setState({ user, token, loading: false })
  }, [])

  const logout = useCallback(() => {
    clearStoredToken()
    setState({ user: null, token: null, loading: false })
  }, [])

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    isAuthenticated: !!state.token && !!state.user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
