import express from 'express'
import { randomUUID } from 'crypto'
import { getWorkspaceForUser, countCodesInWorkspace, getPlanLimit } from './db.js'

export function createWorkspaceMiddleware(db) {
  return async (req, res, next) => {
    if (!req.user?.id) return next(new Error('Auth required'))
    try {
      const workspace = await getWorkspaceForUser(db, req.user.id)
      if (!workspace) {
        return res.status(403).json({ error: 'No workspace found for this user' })
      }
      req.workspace = workspace
      next()
    } catch (err) {
      next(err)
    }
  }
}

export function createWorkspaceRouter(db) {
  const router = express.Router()

  /** GET /api/workspace - current workspace with usage (404 + NO_WORKSPACE when none) */
  router.get('/', async (req, res) => {
    try {
      const ws = await getWorkspaceForUser(db, req.user.id)
      if (!ws) {
        return res.status(404).json({ error: 'No workspace', code: 'NO_WORKSPACE' })
      }
      const count = await countCodesInWorkspace(db, ws.id)
      const limit = getPlanLimit(ws.plan)
      res.json({
        id: ws.id,
        name: ws.name,
        plan: ws.plan,
        code_count: count,
        code_limit: limit,
        at_limit: count >= limit,
        onboarding_completed_at: ws.onboarding_completed_at ?? null,
      })
    } catch (err) {
      console.error('GET /api/workspace', err)
      res.status(500).json({ error: err.message })
    }
  })

  /** POST /api/workspace - create workspace (onboarding step 1; only if user has none) */
  router.post('/', async (req, res) => {
    try {
      const existing = await getWorkspaceForUser(db, req.user.id)
      if (existing) {
        return res.status(400).json({ error: 'You already have a workspace' })
      }
      const { name } = req.body || {}
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'name is required' })
      }
      const workspaceId = randomUUID()
      await db.execute({
        sql: `INSERT INTO workspaces (id, name, plan) VALUES (?, ?, 'free')`,
        args: [workspaceId, name.trim()],
      })
      await db.execute({
        sql: 'INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)',
        args: [workspaceId, req.user.id, 'owner'],
      })
      const ws = {
        id: workspaceId,
        name: name.trim(),
        plan: 'free',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        onboarding_completed_at: null,
      }
      const count = 0
      const limit = getPlanLimit('free')
      res.status(201).json({
        id: ws.id,
        name: ws.name,
        plan: ws.plan,
        code_count: count,
        code_limit: limit,
        at_limit: false,
        onboarding_completed_at: null,
      })
    } catch (err) {
      console.error('POST /api/workspace', err)
      res.status(500).json({ error: err.message })
    }
  })

  /** DELETE /api/workspace - permanently delete workspace and all its data */
  router.delete('/', async (req, res) => {
    const ws = await getWorkspaceForUser(db, req.user.id)
    if (!ws) {
      return res.status(403).json({ error: 'No workspace found for this user' })
    }
    req.workspace = ws
    try {
      const workspaceId = req.workspace.id
      await db.execute({
        sql: 'DELETE FROM qr_codes WHERE workspace_id = ?',
        args: [workspaceId],
      })
      await db.execute({
        sql: 'DELETE FROM workspace_members WHERE workspace_id = ?',
        args: [workspaceId],
      })
      await db.execute({
        sql: 'DELETE FROM workspaces WHERE id = ?',
        args: [workspaceId],
      })
      res.status(204).send()
    } catch (err) {
      console.error('DELETE /api/workspace', err)
      res.status(500).json({ error: err.message })
    }
  })

  /** PATCH /api/workspace - update name */
  router.patch('/', async (req, res) => {
    try {
      const ws = await getWorkspaceForUser(db, req.user.id)
      if (!ws) {
        return res.status(403).json({ error: 'No workspace found for this user' })
      }
      req.workspace = ws
      const { name } = req.body || {}
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'name is required' })
      }
      await db.execute({
        sql: "UPDATE workspaces SET name = ?, updated_at = datetime('now') WHERE id = ?",
        args: [name.trim(), req.workspace.id],
      })
      const updated = { ...req.workspace, name: name.trim() }
      const count = await countCodesInWorkspace(db, updated.id)
      const limit = getPlanLimit(updated.plan)
      res.json({
        id: updated.id,
        name: updated.name,
        plan: updated.plan,
        code_count: count,
        code_limit: limit,
        at_limit: count >= limit,
        onboarding_completed_at: updated.onboarding_completed_at ?? null,
      })
    } catch (err) {
      console.error('PATCH /api/workspace', err)
      res.status(500).json({ error: err.message })
    }
  })

  return router
}
