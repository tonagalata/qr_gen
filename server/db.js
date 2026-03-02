import { createClient } from '@libsql/client'

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  created_at TEXT DEFAULT (datetime('now'))
)`,
  `CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  onboarding_completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
)`,
  `CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (workspace_id, user_id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
)`,
  `CREATE TABLE IF NOT EXISTS qr_codes (
  id TEXT PRIMARY KEY,
  workspace_id TEXT,
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

const ALTER_STATEMENTS = [
  'ALTER TABLE users ADD COLUMN first_name TEXT',
  'ALTER TABLE users ADD COLUMN last_name TEXT',
  'ALTER TABLE users ADD COLUMN email TEXT',
  'ALTER TABLE qr_codes ADD COLUMN workspace_id TEXT',
  'ALTER TABLE workspaces ADD COLUMN onboarding_completed_at TEXT',
]

// Plan limits (align with marketing copy):
// - free (Starter): up to 10 codes
// - pro: up to 1,000 codes
// - team: effectively unlimited (we use a very high ceiling)
const PLAN_LIMITS = { free: 10, pro: 1000, team: 1000000 }

export function getPlanLimit(plan) {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free
}

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
  for (const sql of ALTER_STATEMENTS) {
    try {
      await db.execute(sql)
    } catch (e) {
      if (!e.message?.includes('duplicate') && !e.message?.includes('already exists')) throw e
    }
  }
}

/** Get the first workspace the user belongs to (for current context). */
export async function getWorkspaceForUser(db, userId) {
  const rs = await db.execute({
    sql: `SELECT w.id, w.name, w.plan, w.stripe_customer_id, w.stripe_subscription_id, w.onboarding_completed_at
          FROM workspaces w
          INNER JOIN workspace_members wm ON w.id = wm.workspace_id
          WHERE wm.user_id = ?
          LIMIT 1`,
    args: [userId],
  })
  if (rs.rows.length === 0) return null
  const r = rs.rows[0]
  return {
    id: r.id,
    name: r.name,
    plan: r.plan ?? 'free',
    stripe_customer_id: r.stripe_customer_id ?? null,
    stripe_subscription_id: r.stripe_subscription_id ?? null,
    onboarding_completed_at: r.onboarding_completed_at ?? null,
  }
}

/** Count codes in a workspace. */
export async function countCodesInWorkspace(db, workspaceId) {
  const rs = await db.execute({
    sql: 'SELECT COUNT(*) as n FROM qr_codes WHERE workspace_id = ?',
    args: [workspaceId],
  })
  return Number(rs.rows[0]?.n ?? 0)
}

/** Get workspace by Stripe customer ID (for webhook). */
export async function getWorkspaceByStripeCustomerId(db, stripeCustomerId) {
  const rs = await db.execute({
    sql: 'SELECT id, name, plan, stripe_customer_id, stripe_subscription_id FROM workspaces WHERE stripe_customer_id = ?',
    args: [stripeCustomerId],
  })
  if (rs.rows.length === 0) return null
  const r = rs.rows[0]
  return { id: r.id, name: r.name, plan: r.plan ?? 'free', stripe_customer_id: r.stripe_customer_id, stripe_subscription_id: r.stripe_subscription_id }
}

/** Update workspace Stripe customer ID (after creating customer). */
export async function setWorkspaceStripeCustomerId(db, workspaceId, stripeCustomerId) {
  await db.execute({
    sql: "UPDATE workspaces SET stripe_customer_id = ?, updated_at = datetime('now') WHERE id = ?",
    args: [stripeCustomerId, workspaceId],
  })
}

/** Update workspace plan and subscription ID (from Stripe webhook). */
export async function updateWorkspaceSubscription(db, workspaceId, plan, stripeSubscriptionId) {
  await db.execute({
    sql: "UPDATE workspaces SET plan = ?, stripe_subscription_id = ?, updated_at = datetime('now') WHERE id = ?",
    args: [plan ?? 'free', stripeSubscriptionId ?? null, workspaceId],
  })
}

/** Mark workspace onboarding as completed (e.g. after card on file). */
export async function setWorkspaceOnboardingCompleted(db, workspaceId) {
  await db.execute({
    sql: "UPDATE workspaces SET onboarding_completed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?",
    args: [workspaceId],
  })
}
