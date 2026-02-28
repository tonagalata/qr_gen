import express from 'express'
import { randomUUID } from 'crypto'

/** Codes router: mount at /api/codes. Routes are / and /:id */
export function createRouter(db) {
  const router = express.Router()

  /** List all QR codes */
  router.get('/', async (req, res) => {
    try {
      const status = req.query.status
      const rs = status
        ? await db.execute({
            sql: 'SELECT * FROM qr_codes WHERE status = ? ORDER BY created_at DESC',
            args: [status],
          })
        : await db.execute('SELECT * FROM qr_codes ORDER BY created_at DESC')
      const rows = rs.rows.map(rowToCode)
      res.json(rows)
    } catch (err) {
      console.error('GET /api/codes', err)
      res.status(500).json({ error: err.message })
    }
  })

  /** Get one QR code */
  router.get('/:id', async (req, res) => {
    try {
      const rs = await db.execute({
        sql: 'SELECT * FROM qr_codes WHERE id = ?',
        args: [req.params.id],
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

  /** Create QR code */
  router.post('/', async (req, res) => {
    try {
      const id = randomUUID()
      const { name, subtitle, target_url, status } = req.body || {}
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'name is required' })
      }
      await db.execute({
        sql: `INSERT INTO qr_codes (id, name, subtitle, target_url, status, updated_at)
              VALUES (?, ?, ?, ?, ?, datetime('now'))`,
        args: [
          id,
          name.trim(),
          subtitle ? String(subtitle).trim() : null,
          target_url ? String(target_url).trim() : null,
          status && ['active', 'paused', 'archived', 'static', 'expired'].includes(status) ? status : 'active',
        ],
      })
      const rs = await db.execute({ sql: 'SELECT * FROM qr_codes WHERE id = ?', args: [id] })
      res.status(201).json(rowToCode(rs.rows[0]))
    } catch (err) {
      console.error('POST /api/codes', err)
      res.status(500).json({ error: err.message })
    }
  })

  /** Update QR code */
  router.put('/:id', async (req, res) => {
    try {
      const { name, subtitle, target_url, status } = req.body || {}
      const rs = await db.execute({
        sql: 'SELECT id FROM qr_codes WHERE id = ?',
        args: [req.params.id],
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

  /** Delete QR code */
  router.delete('/:id', async (req, res) => {
    try {
      const rs = await db.execute({
        sql: 'DELETE FROM qr_codes WHERE id = ?',
        args: [req.params.id],
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
    total_scans: Number(row.total_scans) ?? 0,
    unique_scans: Number(row.unique_scans) ?? 0,
    last_scan_at: row.last_scan_at ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}
