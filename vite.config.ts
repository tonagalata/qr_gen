import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import express from 'express'
import { createDb, initSchema } from './server/db.js'
import { createRouter } from './server/api.js'
import { createAuthRouter, createRequireAuth } from './server/auth.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api',
        configureServer(server) {
          const app = express()
          app.use(express.json())

          const apiReady = (async () => {
            try {
              const db = createDb()
              await initSchema(db)
              return {
                authRouter: createAuthRouter(db),
                codesRouter: createRouter(db),
                requireAuth: createRequireAuth(),
              }
            } catch (e) {
              console.error('API init failed:', e)
              throw e
            }
          })()

          app.use('/api', (req, res, next) => {
            apiReady
              .then(({ authRouter, codesRouter, requireAuth }) => {
                if (req.path === '/auth' || req.path.startsWith('/auth/')) {
                  const rest = req.path.replace(/^\/auth\/?/, '/') || '/'
                  req.url = rest + (req.originalUrl.includes('?') ? '?' + req.originalUrl.split('?')[1] : '')
                  return authRouter(req, res, next)
                }
                requireAuth(req, res, (err) => {
                  if (err) return next(err)
                  const rest = req.path.replace(/^\/codes\/?/, '/') || '/'
                  req.url = rest + (req.originalUrl.includes('?') ? '?' + req.originalUrl.split('?')[1] : '')
                  codesRouter(req, res, next)
                })
              })
              .catch(() => {
                res.status(503).json({
                  error:
                    'Database unavailable. Check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env.',
                })
              })
          })

          server.middlewares.use(app)
        },
      },
    ],
  }
})
