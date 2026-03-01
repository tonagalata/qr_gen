import { createContext, useCallback, useContext, useState } from 'react'

type Toast = { id: number; message: string; type?: 'success' | 'error' | 'info' }

interface ToastContextValue {
  toast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let id = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const t: Toast = { id: ++id, message, type }
    setToasts((prev) => [...prev, t])
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast-in pointer-events-auto rounded-xl border shadow-lg border-[--color-border-subtle] bg-white px-4 py-3 text-sm shadow-lg"
            role="status"
          >
            {t.type === 'error' && <span className="mr-2 text-red-500">✕</span>}
            {t.type === 'success' && <span className="mr-2 text-emerald-500">✓</span>}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) return { toast: () => {} }
  return ctx
}
