import express from 'express'
import { randomUUID } from 'crypto'
import { countCodesInWorkspace, getPlanLimit, generateUniqueSlug } from './db.js'

// Cap the stored logo data URL to keep rows small (~225KB decoded).
const MAX_LOGO_DATA_URL_LENGTH = 400_000
const LOGO_DATA_URL_RE = /^data:image\/(png|jpeg|jpg|webp|svg\+xml);base64,/

function normalizeLogoDataUrl(value) {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  if (typeof value !== 'string' || !LOGO_DATA_URL_RE.test(value) || value.length > MAX_LOGO_DATA_URL_LENGTH) {
    return { error: 'logo_data_url must be a PNG/JPEG/WebP/SVG data URL under 300KB' }
  }
  return value
}

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
      const { name, subtitle, target_url, status, logo_data_url } = req.body || {}
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'name is required' })
      }
      const logo = normalizeLogoDataUrl(logo_data_url)
      if (logo && logo.error) {
        return res.status(400).json({ error: logo.error })
      }
      const short_slug = await generateUniqueSlug(db)
      await db.execute({
        sql: `INSERT INTO qr_codes (id, workspace_id, name, subtitle, target_url, status, short_slug, logo_data_url, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        args: [
          id,
          wid,
          name.trim(),
          subtitle ? String(subtitle).trim() : null,
          target_url ? String(target_url).trim() : null,
          status && ['active', 'paused', 'archived', 'static', 'expired'].includes(status) ? status : 'active',
          short_slug,
          logo ?? null,
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
      const { name, subtitle, target_url, status, logo_data_url } = req.body || {}
      const logo = normalizeLogoDataUrl(logo_data_url)
      if (logo && logo.error) {
        return res.status(400).json({ error: logo.error })
      }
      const rs = await db.execute({
        sql: 'SELECT id FROM qr_codes WHERE id = ? AND workspace_id = ?',
        args: [req.params.id, wid],
      })
      if (rs.rows.length === 0) {
        return res.status(404).json({ error: 'Not found' })
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
      if (logo_data_url !== undefined) {
        updates.push('logo_data_url = ?')
        args.push(logo ?? null)
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
    logo_data_url: row.logo_data_url ?? null,
    total_scans: Number(row.total_scans) ?? 0,
    unique_scans: Number(row.unique_scans) ?? 0,
    last_scan_at: row.last_scan_at ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}
