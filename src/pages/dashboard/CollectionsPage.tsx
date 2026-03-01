import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'
import {
  loadCollections,
  addCollection,
  removeCollection,
  renameCollection,
} from '../../lib/collections'

export function CollectionsPage() {
  const { toast } = useToast()
  const [collections, setCollections] = useState(() => loadCollections())
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    collections.names.forEach((n) => { c[n] = 0 })
    Object.values(collections.codeToCollection).forEach((n) => { c[n] = (c[n] ?? 0) + 1 })
    return c
  }, [collections])

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    if (collections.names.includes(name)) {
      toast('Collection already exists.', 'error')
      return
    }
    addCollection(name)
    setCollections(loadCollections())
    setNewName('')
    toast('Collection created.')
  }

  function handleRemove(name: string) {
    if (!confirm(`Delete collection “${name}”? Codes will be unassigned.`)) return
    removeCollection(name)
    setCollections(loadCollections())
    toast('Collection removed.')
  }

  function startRename(name: string) {
    setEditingId(name)
    setEditValue(name)
  }

  function submitRename() {
    if (!editingId) return
    const next = editValue.trim()
    if (next && next !== editingId) {
      if (collections.names.includes(next)) {
        toast('A collection with that name already exists.', 'error')
        return
      }
      renameCollection(editingId, next)
      setCollections(loadCollections())
      toast('Collection renamed.')
    }
    setEditingId(null)
    setEditValue('')
  }

  return (
    <div className="space-y-6">
      <section className="glass-surface border border-[--color-border-subtle] p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[--color-text-muted]">
              Collections
            </p>
            <p className="mt-1 text-sm text-[--color-text-muted]">
              Organize codes into folders. Assign codes from the My Codes page.
            </p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="mt-6 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="input-field max-w-xs"
            placeholder="New collection name"
          />
          <button type="submit" className="btn-primary h-10 rounded-xl px-4 text-sm" disabled={!newName.trim()}>
            New collection
          </button>
        </form>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collections.names.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-[--color-border-subtle] bg-[--color-surface-soft] px-5 py-10 text-center">
              <p className="text-sm font-medium text-slate-900">No collections yet</p>
              <p className="mt-1 text-xs text-[--color-text-muted]">
                Create one above, then assign codes from My Codes.
              </p>
            </div>
          ) : (
            collections.names.map((name) => (
              <div
                key={name}
                className="flex flex-col rounded-2xl border border-[--color-border-subtle] bg-white/95 p-4 shadow-sm"
              >
                {editingId === name ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="input-field flex-1"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && submitRename()}
                    />
                    <button type="button" className="btn-primary h-9 rounded-lg px-3 text-xs" onClick={submitRename}>
                      Save
                    </button>
                    <button type="button" className="btn-ghost h-9 rounded-lg px-3 text-xs" onClick={() => { setEditingId(null); setEditValue('') }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{name}</p>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className="rounded-lg px-2 py-1 text-[11px] text-[--color-text-muted] hover:bg-slate-100 hover:text-slate-700"
                          onClick={() => startRename(name)}
                          aria-label="Rename"
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          className="rounded-lg px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-50"
                          onClick={() => handleRemove(name)}
                          aria-label="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] text-[--color-text-muted]">
                      {counts[name] ?? 0} code{(counts[name] ?? 0) !== 1 ? 's' : ''}
                    </p>
                    <Link
                      to="/dashboard/codes"
                      className="btn-ghost mt-3 h-8 w-fit rounded-lg px-3 text-[11px]"
                    >
                      View codes
                    </Link>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
