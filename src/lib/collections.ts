const KEY = 'qr-studio-collections'

export interface CollectionsData {
  names: string[]
  codeToCollection: Record<string, string>
}

const defaults: CollectionsData = {
  names: [],
  codeToCollection: {},
}

export function loadCollections(): CollectionsData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...defaults, codeToCollection: {} }
    const parsed = JSON.parse(raw) as Partial<CollectionsData>
    return {
      names: Array.isArray(parsed.names) ? parsed.names : [],
      codeToCollection: parsed.codeToCollection && typeof parsed.codeToCollection === 'object' ? parsed.codeToCollection : {},
    }
  } catch {
    return { ...defaults, codeToCollection: {} }
  }
}

export function saveCollections(data: CollectionsData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function addCollection(name: string): void {
  const d = loadCollections()
  if (d.names.includes(name)) return
  d.names.push(name)
  saveCollections(d)
}

export function removeCollection(name: string): void {
  const d = loadCollections()
  d.names = d.names.filter((n) => n !== name)
  Object.keys(d.codeToCollection).forEach((id) => {
    if (d.codeToCollection[id] === name) delete d.codeToCollection[id]
  })
  saveCollections(d)
}

export function renameCollection(oldName: string, newName: string): void {
  const d = loadCollections()
  if (!d.names.includes(oldName) || d.names.includes(newName)) return
  d.names = d.names.map((n) => (n === oldName ? newName : n))
  Object.keys(d.codeToCollection).forEach((id) => {
    if (d.codeToCollection[id] === oldName) d.codeToCollection[id] = newName
  })
  saveCollections(d)
}

export function setCodeCollection(codeId: string, collectionName: string | null): void {
  const d = loadCollections()
  if (collectionName === null) {
    delete d.codeToCollection[codeId]
  } else {
    d.codeToCollection[codeId] = collectionName
  }
  saveCollections(d)
}

export function getCodeCollection(codeId: string): string | null {
  return loadCollections().codeToCollection[codeId] ?? null
}
