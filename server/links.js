/**
 * Short link redirect: GET /s/:slug
 * Resolves a short slug to the associated QR code's target_url, records the
 * click using the same scan counters, then redirects. No auth required.
 */

const COOKIE_NAME = 'qr_seen'
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1 year

export function createLinksHandler(db) {
  return async (req, res) => {
    const slug = req.params.slug
    if (!slug) {
      return res.status(400).send('Missing slug')
    }
    try {
      const rs = await db.execute({
        sql: 'SELECT id, target_url FROM qr_codes WHERE short_slug = ?',
        args: [slug],
      })
      if (rs.rows.length === 0) {
        return res.status(404).send('Link not found')
      }
      const row = rs.rows[0]
      const id = String(row.id)
      const targetUrl = row.target_url && String(row.target_url).trim()
      const redirectTo = targetUrl || 'https://example.com'

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
        res.setHeader(
          'Set-Cookie',
          `${COOKIE_NAME}=${encodeURIComponent(newSeen.join(','))}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`,
        )
      }

      res.redirect(302, redirectTo)
    } catch (err) {
      console.error('GET /s/:slug', err)
      res.status(500).send('Something went wrong')
    }
  }
}
