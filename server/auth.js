import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'

const SALT_ROUNDS = 10
const JWT_SECRET = process.env.JWT_SECRET || 'qr-gen-dev-secret-change-in-production'
const JWT_EXPIRES = '7d'

export function createAuthRouter(db) {
  const router = express.Router()

  /** Register: first_name, last_name, username, password; create user only (workspace via onboarding) */
  router.post('/register', async (req, res) => {
    try {
      const { first_name, last_name, username, password, email } = req.body || {}
      if (!username || typeof username !== 'string' || !username.trim()) {
        return res.status(400).json({ error: 'Username is required' })
      }
      if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' })
      }
      const firstName = first_name && typeof first_name === 'string' ? first_name.trim() : null
      const lastName = last_name && typeof last_name === 'string' ? last_name.trim() : null
      if (!firstName) return res.status(400).json({ error: 'First name is required' })
      if (!lastName) return res.status(400).json({ error: 'Last name is required' })
      const uname = username.trim().toLowerCase()
      const existing = await db.execute({
        sql: 'SELECT id FROM users WHERE username = ?',
        args: [uname],
      })
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Username already taken' })
      }
      const hash = await bcrypt.hash(password, SALT_ROUNDS)
      const userId = randomUUID()
      const emailVal = email && typeof email === 'string' ? email.trim() || null : null

      await db.execute({
        sql: 'INSERT INTO users (id, username, password_hash, first_name, last_name, email) VALUES (?, ?, ?, ?, ?, ?)',
        args: [userId, uname, hash, firstName, lastName, emailVal],
      })

      const token = jwt.sign(
        {
          sub: userId,
          username: uname,
          email: emailVal ?? undefined,
          first_name: firstName,
          last_name: lastName,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
      )
      res.status(201).json({
        user: {
          id: userId,
          username: uname,
          first_name: firstName,
          last_name: lastName,
          email: emailVal,
        },
        token,
      })
    } catch (err) {
      console.error('POST /api/auth/register', err)
      res.status(500).json({ error: err.message })
    }
  })

  /** Login: username + password, return user with first_name, last_name, email */
  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body || {}
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' })
      }
      const name = String(username).trim().toLowerCase()
      const rs = await db.execute({
        sql: 'SELECT id, username, password_hash, first_name, last_name, email FROM users WHERE username = ?',
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
        {
          sub: user.id,
          username: user.username,
          email: user.email ?? undefined,
          first_name: user.first_name ?? undefined,
          last_name: user.last_name ?? undefined,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
      )
      res.json({
        user: {
          id: user.id,
          username: user.username,
          first_name: user.first_name ?? null,
          last_name: user.last_name ?? null,
          email: user.email ?? null,
        },
        token,
      })
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
      req.user = {
        id: payload.sub,
        username: payload.username,
        email: payload.email ?? null,
        first_name: payload.first_name ?? null,
        last_name: payload.last_name ?? null,
      }
      next()
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
  }
}
