import { createClient } from '@libsql/client'

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
)`,
  `CREATE TABLE IF NOT EXISTS qr_codes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subtitle TEXT,
  target_url TEXT,
  status TEXT DEFAULT 'active',
  total_scans INTEGER DEFAULT 0,
  unique_scans INTEGER DEFAULT 0,
  last_scan_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
)`,
]

export function createDb() {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  if (!url || !authToken) {
    throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set (e.g. in .env)')
  }
  return createClient({ url, authToken })
}

export async function initSchema(db) {
  for (const sql of SCHEMA_STATEMENTS) {
    await db.execute(sql)
  }
}
