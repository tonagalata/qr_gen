import express from 'express'
import serverless from 'serverless-http'
import { createDb, initSchema } from '../../server/db.js'
import { createRouter } from '../../server/api.js'
import { createAuthRouter, createRequireAuth } from '../../server/auth.js'
import { createScanHandler } from '../../server/scan.js'
import { createLinksHandler } from '../../server/links.js'
import { createWorkspaceMiddleware, createWorkspaceRouter } from '../../server/workspace.js'
import { createBillingRouter, handleStripeWebhook } from '../../server/billing.js'

let apiReady = null

async function getApi() {
  if (apiReady) return apiReady
  const db = createDb()
  await initSchema(db)
  apiReady = {
    db,
    authRouter: createAuthRouter(db),
    codesRouter: createRouter(db),
    requireAuth: createRequireAuth(),
    workspaceMiddleware: createWorkspaceMiddleware(db),
    workspaceRouter: createWorkspaceRouter(db),
    billingRouter: createBillingRouter(db),
    scanHandler: createScanHandler(db),
    linksHandler: createLinksHandler(db),
  }
  return apiReady
}

const app = express()
app.post(
  '/api/billing/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res, next) => {
    try {
      const api = await getApi()
      await handleStripeWebhook(req, res, api.db)
    } catch (e) {
      next(e)
    }
  }
)
app.use(express.json())

app.get('/r/:id', async (req, res, next) => {
  try {
    const { scanHandler } = await getApi()
    await scanHandler(req, res)
  } catch (e) {
    next(e)
  }
})

app.get('/s/:slug', async (req, res, next) => {
  try {
    const { linksHandler } = await getApi()
    await linksHandler(req, res)
  } catch (e) {
    next(e)
  }
})

app.use('/api', async (req, res, next) => {
  try {
    const {
      authRouter,
      codesRouter,
      requireAuth,
      workspaceMiddleware,
      workspaceRouter,
      billingRouter,
    } = await getApi()
    const path = req.path
    if (path === '/auth' || path.startsWith('/auth/')) {
      const rest = path.replace(/^\/auth\/?/, '/') || '/'
      req.url = rest + (req.originalUrl.includes('?') ? '?' + req.originalUrl.split('?')[1] : '')
      return authRouter(req, res, next)
    }
    const runWithWorkspace = (handler) => {
      requireAuth(req, res, (err) => {
        if (err) return next(err)
        workspaceMiddleware(req, res, (err2) => {
          if (err2) return next(err2)
          handler()
        })
      })
    }
    if (path === '/workspace' || path.startsWith('/workspace/')) {
      requireAuth(req, res, (err) => {
        if (err) return next(err)
        const rest = path.replace(/^\/workspace\/?/, '/') || '/'
        req.url = rest + (req.originalUrl.includes('?') ? '?' + req.originalUrl.split('?')[1] : '')
        workspaceRouter(req, res, next)
      })
      return
    }
    if (path === '/billing/checkout' || path === '/billing/portal' || path === '/billing/setup' || path === '/billing/confirm-onboarding') {
      runWithWorkspace(() => {
        const rest =
          path === '/billing/checkout' ? '/checkout' : path === '/billing/portal' ? '/portal' : path === '/billing/confirm-onboarding' ? '/confirm-onboarding' : '/setup'
        req.url = rest + (req.originalUrl.includes('?') ? '?' + req.originalUrl.split('?')[1] : '')
        billingRouter(req, res, next)
      })
      return
    }
    if (path === '/codes' || path.startsWith('/codes/')) {
      runWithWorkspace(() => {
        const rest = path.replace(/^\/codes\/?/, '/') || '/'
        req.url = rest + (req.originalUrl.includes('?') ? '?' + req.originalUrl.split('?')[1] : '')
        codesRouter(req, res, next)
      })
      return
    }
    next()
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
