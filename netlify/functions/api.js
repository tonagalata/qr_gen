import express from 'express'
import serverless from 'serverless-http'
import { createDb, initSchema } from '../../server/db.js'
import { createRouter } from '../../server/api.js'
import { createAuthRouter, createRequireAuth } from '../../server/auth.js'
import { createScanHandler } from '../../server/scan.js'

let apiReady = null

async function getApi() {
  if (apiReady) return apiReady
  const db = createDb()
  await initSchema(db)
  apiReady = {
    authRouter: createAuthRouter(db),
    codesRouter: createRouter(db),
    requireAuth: createRequireAuth(),
    scanHandler: createScanHandler(db),
  }
  return apiReady
}

const app = express()
app.use(express.json())

app.get('/r/:id', async (req, res, next) => {
  try {
    const { scanHandler } = await getApi()
    await scanHandler(req, res)
  } catch (e) {
    next(e)
  }
})

app.use('/api', async (req, res, next) => {
  try {
    const { authRouter, codesRouter, requireAuth } = await getApi()
    const path = req.path
    if (path === '/auth' || path.startsWith('/auth/')) {
      const rest = path.replace(/^\/auth\/?/, '/') || '/'
      req.url = rest + (req.originalUrl.includes('?') ? '?' + req.originalUrl.split('?')[1] : '')
      return authRouter(req, res, next)
    }
    requireAuth(req, res, (err) => {
      if (err) return next(err)
      const rest = path.replace(/^\/codes\/?/, '/') || '/'
      req.url = rest + (req.originalUrl.includes('?') ? '?' + req.originalUrl.split('?')[1] : '')
      codesRouter(req, res, next)
    })
  } catch (e) {
    console.error('API init failed:', e)
    res.status(503).json({
      error: 'Database unavailable. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Netlify env.',
    })
  }
})

const serverlessHandler = serverless(app)

export async function handler(event, context) {
  if (event.path && event.path.startsWith('/.netlify/functions/api')) {
    event.path = '/api' + event.path.slice('/.netlify/functions/api'.length) || '/api'
  }
  return serverlessHandler(event, context)
}
