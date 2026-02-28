import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'

const SALT_ROUNDS = 10
const JWT_SECRET = process.env.JWT_SECRET || 'qr-gen-dev-secret-change-in-production'
const JWT_EXPIRES = '7d'

export function createAuthRouter(db) {
  const router = express.Router()

  /** Register: username + password, store bcrypt hash */
  router.post('/register', async (req, res) => {
    try {
      const { username, password } = req.body || {}
      if (!username || typeof username !== 'string' || !username.trim()) {
        return res.status(400).json({ error: 'Username is required' })
      }
      if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' })
      }
      const name = username.trim().toLowerCase()
      const existing = await db.execute({
        sql: 'SELECT id FROM users WHERE username = ?',
        args: [name],
      })
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Username already taken' })
      }
      const hash = await bcrypt.hash(password, SALT_ROUNDS)
      const id = randomUUID()
      await db.execute({
        sql: 'INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)',
        args: [id, name, hash],
      })
      const token = jwt.sign({ sub: id, username: name }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
      res.status(201).json({ user: { id, username: name }, token })
    } catch (err) {
      console.error('POST /api/auth/register', err)
      res.status(500).json({ error: err.message })
    }
  })

  /** Login: username + password, compare with bcrypt, return JWT */
  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body || {}
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' })
      }
      const name = String(username).trim().toLowerCase()
      const rs = await db.execute({
        sql: 'SELECT id, username, password_hash FROM users WHERE username = ?',
        args: [name],
      })
      if (rs.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid username or password' })
      }
      const user = rs.rows[0]
      const ok = await bcrypt.compare(password, user.password_hash)
      if (!ok) {
        return res.status(401).json({ error: 'Invalid username or password' })
      }
      const token = jwt.sign(
        { sub: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
      )
      res.json({ user: { id: user.id, username: user.username }, token })
    } catch (err) {
      console.error('POST /api/auth/login', err)
      res.status(500).json({ error: err.message })
    }
  })

  return router
}

export function createRequireAuth() {
  return (req, res, next) => {
    const auth = req.headers.authorization
    const token = auth && auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET)
      req.user = { id: payload.sub, username: payload.username }
      next()
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
  }
}
