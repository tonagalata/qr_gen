import { useState } from 'react'

export function DeleteConfirmModal({
  resourceType,
  resourceName,
  confirmText,
  onClose,
  onConfirm,
}: {
  resourceType: string
  resourceName: string
  confirmText: string
  onClose: () => void
  onConfirm: () => void | Promise<void>
}) {
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const isMatch = inputValue.trim() === confirmText

  const handleConfirm = async () => {
    if (!isMatch) return
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="glass-surface w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-semibold text-slate-900">
          Delete {resourceType}?
        </p>
        <p className="mt-1 text-sm text-slate-600">
          <span className="font-medium">&quot;{resourceName}&quot;</span> will be permanently deleted. This cannot be undone.
        </p>
        <p className="mt-4 text-xs text-[--color-text-muted]">
          Type <kbd className="rounded border border-[--color-border-subtle] bg-slate-100 px-1.5 py-0.5 font-mono text-[11px]">{confirmText}</kbd> to confirm.
        </p>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={confirmText}
          className="input-field mt-2 w-full"
          autoComplete="off"
          spellCheck={false}
          aria-label={`Type ${confirmText} to confirm deletion`}
        />
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleConfirm}
            disabled={loading || !isMatch}
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
