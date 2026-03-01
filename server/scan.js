/**
 * Public scan redirect: GET /r/:id
 * Records the scan (total_scans, unique_scans, last_scan_at) then redirects to the code's target_url.
 * No auth required. QR codes should point to this URL (e.g. https://yourapp.com/r/<codeId>).
 */

const COOKIE_NAME = 'qr_seen'
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1 year

export function createScanHandler(db) {
  return async (req, res) => {
    const id = req.params.id
    if (!id) {
      return res.status(400).send('Missing code id')
    }
    try {
      const rs = await db.execute({
        sql: 'SELECT id, target_url, status FROM qr_codes WHERE id = ?',
        args: [id],
      })
      if (rs.rows.length === 0) {
        return res.status(404).send('QR code not found')
      }
      const row = rs.rows[0]
      const targetUrl = row.target_url && String(row.target_url).trim()
      const redirectTo = targetUrl || `https://example.com`

      const cookieHeader = req.headers.cookie || ''
      const seenCookie = cookieHeader.split(';').find((c) => c.trim().startsWith(`${COOKIE_NAME}=`))
      const seenIds = seenCookie ? decodeURIComponent((seenCookie.split('=')[1] || '').trim()).split(',') : []
      const isUnique = !seenIds.includes(id)

      await db.execute({
        sql: `UPDATE qr_codes SET
          total_scans = total_scans + 1,
          unique_scans = unique_scans + ?,
          last_scan_at = datetime('now'),
          updated_at = datetime('now')
          WHERE id = ?`,
        args: [isUnique ? 1 : 0, id],
      })

      if (isUnique) {
        const newSeen = [...seenIds.filter(Boolean), id].slice(-50)
        res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(newSeen.join(','))}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`)
      }

      res.redirect(302, redirectTo)
    } catch (err) {
      console.error('GET /r/:id', err)
      res.status(500).send('Something went wrong')
    }
  }
}
