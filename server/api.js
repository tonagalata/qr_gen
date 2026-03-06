import express from 'express'
import { randomUUID } from 'crypto'
import { countCodesInWorkspace, getPlanLimit, generateUniqueSlug } from './db.js'

/** Codes router: mount at /api/codes. Requires req.workspace (set by workspace middleware). */
export function createRouter(db) {
  const router = express.Router()

  /** List all QR codes for current workspace */
  router.get('/', async (req, res) => {
    try {
      const wid = req.workspace?.id
      if (!wid) return res.status(403).json({ error: 'Workspace required' })
      const status = req.query.status
      const rs = status
        ? await db.execute({
            sql: 'SELECT * FROM qr_codes WHERE workspace_id = ? AND status = ? ORDER BY created_at DESC',
            args: [wid, status],
          })
        : await db.execute({
            sql: 'SELECT * FROM qr_codes WHERE workspace_id = ? ORDER BY created_at DESC',
            args: [wid],
          })
      const rows = rs.rows.map(rowToCode)
      res.json(rows)
    } catch (err) {
      console.error('GET /api/codes', err)
      res.status(500).json({ error: err.message })
    }
  })

  /** Get one QR code (must belong to workspace) */
  router.get('/:id', async (req, res) => {
    try {
      const wid = req.workspace?.id
      if (!wid) return res.status(403).json({ error: 'Workspace required' })
      const rs = await db.execute({
        sql: 'SELECT * FROM qr_codes WHERE id = ? AND workspace_id = ?',
        args: [req.params.id, wid],
      })
      if (rs.rows.length === 0) {
        return res.status(404).json({ error: 'Not found' })
      }
      res.json(rowToCode(rs.rows[0]))
    } catch (err) {
      console.error('GET /api/codes/:id', err)
      res.status(500).json({ error: err.message })
    }
  })

  /** Create QR code (enforce plan limit: free = 5) */
  router.post('/', async (req, res) => {
    try {
      const wid = req.workspace?.id
      if (!wid) return res.status(403).json({ error: 'Workspace required' })
      const limit = getPlanLimit(req.workspace.plan)
      const count = await countCodesInWorkspace(db, wid)
      if (count >= limit) {
        return res.status(403).json({
          error: `Plan limit reached (${limit} codes). Upgrade to create more.`,
          code: 'PLAN_LIMIT_REACHED',
        })
      }
      const id = randomUUID()
      const { name, subtitle, target_url, status } = req.body || {}
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'name is required' })
      }
      const short_slug = await generateUniqueSlug(db)
      await db.execute({
        sql: `INSERT INTO qr_codes (id, workspace_id, name, subtitle, target_url, status, short_slug, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        args: [
          id,
          wid,
          name.trim(),
          subtitle ? String(subtitle).trim() : null,
          target_url ? String(target_url).trim() : null,
          status && ['active', 'paused', 'archived', 'static', 'expired'].includes(status) ? status : 'active',
          short_slug,
        ],
      })
      const rs = await db.execute({ sql: 'SELECT * FROM qr_codes WHERE id = ?', args: [id] })
      res.status(201).json(rowToCode(rs.rows[0]))
    } catch (err) {
      console.error('POST /api/codes', err)
      res.status(500).json({ error: err.message })
    }
  })

  /** Update QR code (must belong to workspace). Free plan: no edit. No edit after code has been scanned. */
  router.put('/:id', async (req, res) => {
    try {
      const wid = req.workspace?.id
      if (!wid) return res.status(403).json({ error: 'Workspace required' })
      if (req.workspace.plan === 'free') {
        return res.status(403).json({
          error: 'Editing codes is not available on the free plan. Upgrade to edit.',
          code: 'FREE_PLAN_NO_EDIT',
        })
      }
      const { name, subtitle, target_url, status } = req.body || {}
      const rs = await db.execute({
        sql: 'SELECT id, total_scans FROM qr_codes WHERE id = ? AND workspace_id = ?',
        args: [req.params.id, wid],
      })
      if (rs.rows.length === 0) {
        return res.status(404).json({ error: 'Not found' })
      }
      const row = rs.rows[0]
      const totalScans = Number(row.total_scans ?? 0)
      if (totalScans > 0) {
        return res.status(403).json({
          error: 'Codes cannot be edited after they have been scanned.',
          code: 'NO_EDIT_AFTER_SCAN',
        })
      }
      const updates = []
      const args = []
      if (name !== undefined) {
        updates.push('name = ?')
        args.push(typeof name === 'string' ? name.trim() : '')
      }
      if (subtitle !== undefined) {
        updates.push('subtitle = ?')
        args.push(subtitle ? String(subtitle).trim() : null)
      }
      if (target_url !== undefined) {
        updates.push('target_url = ?')
        args.push(target_url ? String(target_url).trim() : null)
      }
      if (status !== undefined && ['active', 'paused', 'archived', 'static', 'expired'].includes(status)) {
        updates.push('status = ?')
        args.push(status)
      }
      if (updates.length === 0) {
        const r = await db.execute({ sql: 'SELECT * FROM qr_codes WHERE id = ?', args: [req.params.id] })
        return res.json(rowToCode(r.rows[0]))
      }
      updates.push("updated_at = datetime('now')")
      args.push(req.params.id)
      await db.execute({
        sql: `UPDATE qr_codes SET ${updates.join(', ')} WHERE id = ?`,
        args,
      })
      const r = await db.execute({ sql: 'SELECT * FROM qr_codes WHERE id = ?', args: [req.params.id] })
      res.json(rowToCode(r.rows[0]))
    } catch (err) {
      console.error('PUT /api/codes/:id', err)
      res.status(500).json({ error: err.message })
    }
  })

  /** Delete QR code (must belong to workspace). Free plan: no delete. */
  router.delete('/:id', async (req, res) => {
    try {
      const wid = req.workspace?.id
      if (!wid) return res.status(403).json({ error: 'Workspace required' })
      if (req.workspace.plan === 'free') {
        return res.status(403).json({
          error: 'Deleting codes is not available on the free plan. Upgrade to delete.',
          code: 'FREE_PLAN_NO_DELETE',
        })
      }
      const rs = await db.execute({
        sql: 'DELETE FROM qr_codes WHERE id = ? AND workspace_id = ?',
        args: [req.params.id, wid],
      })
      if (rs.rowsAffected === 0) {
        return res.status(404).json({ error: 'Not found' })
      }
      res.status(204).send()
    } catch (err) {
      console.error('DELETE /api/codes/:id', err)
      res.status(500).json({ error: err.message })
    }
  })

  return router
}

function rowToCode(row) {
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle ?? '',
    target_url: row.target_url ?? '',
    status: row.status ?? 'active',
    short_slug: row.short_slug ?? null,
    total_scans: Number(row.total_scans) ?? 0,
    unique_scans: Number(row.unique_scans) ?? 0,
    last_scan_at: row.last_scan_at ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}
