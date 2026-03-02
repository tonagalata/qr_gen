import express from 'express'
import { stripe, getOrCreateCustomerByEmail } from './stripe.js'
import {
  getWorkspaceByStripeCustomerId,
  setWorkspaceStripeCustomerId,
  updateWorkspaceSubscription,
  setWorkspaceOnboardingCompleted,
} from './db.js'

const STRIPE_PRICE_PRO = process.env.STRIPE_PRICE_ID_PRO   // Pro subscription
const STRIPE_PRICE_TEAM = process.env.STRIPE_PRICE_ID_TEAM // Team subscription

function planFromPriceId(priceId) {
  if (priceId === STRIPE_PRICE_TEAM) return 'team'
  if (priceId === STRIPE_PRICE_PRO) return 'pro'
  return 'free'
}

/**
 * Create billing router. Requires auth + workspace middleware for checkout/portal.
 * Webhook is mounted separately with raw body.
 */
export function createBillingRouter(db) {
  const router = express.Router()

  /** POST /api/billing/checkout - create Stripe Checkout session (subscription: Pro or Team) */
  router.post('/checkout', async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: 'Stripe is not configured.' })
      }
      const workspace = req.workspace
      const planSlug = (req.body?.plan || 'pro').toLowerCase()
      const priceId = planSlug === 'team' ? STRIPE_PRICE_TEAM : STRIPE_PRICE_PRO
      if (!priceId) {
        const missing = planSlug === 'team' ? 'STRIPE_PRICE_ID_TEAM' : 'STRIPE_PRICE_ID_PRO'
        return res.status(400).json({
          error: `Billing not configured. Set ${missing} in .env`,
        })
      }
      let customerId = workspace.stripe_customer_id
      if (!customerId) {
        const email =
          req.user?.email?.trim() ||
          (req.user?.username ? `${req.user.username}@qrstudio.app` : null)
        if (!email) {
          return res.status(400).json({ error: 'Email or username required for billing.' })
        }
        const customer = await getOrCreateCustomerByEmail(email)
        customerId = customer.id
        await setWorkspaceStripeCustomerId(db, workspace.id, customerId)
      }
      const origin = req.headers.origin || req.protocol + '://' + req.get('host') || 'http://localhost:5173'
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        subscription_data: { metadata: { workspace_id: workspace.id } },
        success_url: `${origin}/dashboard/settings?billing=success`,
        cancel_url: `${origin}/dashboard/settings?billing=cancelled`,
      })
      res.json({ url: session.url })
    } catch (err) {
      console.error('POST /api/billing/checkout', err)
      const msg = err?.message || ''
      if (msg.includes('live mode') && msg.includes('test mode key')) {
        return res.status(400).json({
          error: 'Price IDs are for live mode but you’re using a test key (or vice versa). Use test price IDs with sk_test_ and live price IDs with sk_live_.',
        })
      }
      res.status(500).json({ error: msg || 'Unable to start checkout.' })
    }
  })

  /** POST /api/billing/setup - create Stripe Checkout session (mode: setup) for card on file */
  router.post('/setup', async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: 'Stripe is not configured.' })
      }
      const workspace = req.workspace
      let customerId = workspace.stripe_customer_id
      if (!customerId) {
        const email =
          req.user?.email?.trim() ||
          (req.user?.username ? `${req.user.username}@qrstudio.app` : null)
        if (!email) {
          return res.status(400).json({ error: 'Email or username required for billing.' })
        }
        const customer = await getOrCreateCustomerByEmail(email)
        customerId = customer.id
        await setWorkspaceStripeCustomerId(db, workspace.id, customerId)
      }
      const origin = req.headers.origin || req.protocol + '://' + req.get('host') || 'http://localhost:5173'
      const session = await stripe.checkout.sessions.create({
        mode: 'setup',
        customer: customerId,
        currency: 'usd',
        metadata: { workspace_id: workspace.id },
        success_url: `${origin}/onboarding?step=complete`,
        cancel_url: `${origin}/onboarding?step=card`,
      })
      res.json({ url: session.url })
    } catch (err) {
      console.error('POST /api/billing/setup', err)
      res.status(500).json({ error: err?.message || 'Unable to start setup.' })
    }
  })

  /** POST /api/billing/confirm-onboarding - mark onboarding complete if customer has a payment method (fallback when webhook does not run) */
  router.post('/confirm-onboarding', async (req, res) => {
    try {
      const workspace = req.workspace
      const customerId = workspace.stripe_customer_id
      if (!stripe || !customerId) {
        return res.status(400).json({ error: 'No billing customer yet' })
      }
      const methods = await stripe.paymentMethods.list({ customer: customerId, type: 'card' })
      if (methods.data.length === 0) {
        return res.status(400).json({ error: 'No payment method on file yet' })
      }
      await setWorkspaceOnboardingCompleted(db, workspace.id)
      res.json({ ok: true })
    } catch (err) {
      console.error('POST /api/billing/confirm-onboarding', err)
      res.status(500).json({ error: err?.message || 'Unable to confirm onboarding.' })
    }
  })

  /** POST /api/billing/portal - create Stripe Billing Portal session */
  router.post('/portal', async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: 'Stripe is not configured.' })
      }
      const workspace = req.workspace
      let customerId = workspace.stripe_customer_id
      if (!customerId) {
        const email =
          req.user?.email?.trim() ||
          (req.user?.username ? `${req.user.username}@qrstudio.app` : null)
        if (!email) {
          return res.status(400).json({ error: 'Email or username required for billing portal.' })
        }
        const customer = await getOrCreateCustomerByEmail(email)
        customerId = customer.id
        await setWorkspaceStripeCustomerId(db, workspace.id, customerId)
      }
      const origin = req.headers.origin || req.protocol + '://' + req.get('host') || 'http://localhost:5173'
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/dashboard/settings?billing=portal-return`,
      })
      res.json({ url: session.url })
    } catch (err) {
      console.error('POST /api/billing/portal', err)
      res.status(500).json({ error: err?.message || 'Unable to open billing portal.' })
    }
  })

  return router
}

/**
 * Handle Stripe webhook (raw body). Call this from a route that uses express.raw().
 */
export async function handleStripeWebhook(req, res, db) {
  const sig = req.headers['stripe-signature']
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !stripe) {
    return res.status(500).send('Webhook not configured')
  }
  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err?.message)
    return res.status(400).send(`Webhook Error: ${err?.message}`)
  }
  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const sub = event.data.object
    const workspaceId = sub.metadata?.workspace_id
    let plan = 'free'
    if (sub.items?.data?.[0]?.price?.id) {
      plan = planFromPriceId(sub.items.data[0].price.id)
    }
    if (workspaceId) {
      await updateWorkspaceSubscription(db, workspaceId, plan, sub.id)
    } else {
      const ws = await getWorkspaceByStripeCustomerId(db, sub.customer)
      if (ws) await updateWorkspaceSubscription(db, ws.id, plan, sub.id)
    }
  } else if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object
    const ws = await getWorkspaceByStripeCustomerId(db, sub.customer)
    if (ws) await updateWorkspaceSubscription(db, ws.id, 'free', null)
  } else if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    if (session.mode === 'setup') {
      const workspaceId = session.metadata?.workspace_id
      if (workspaceId) {
        await setWorkspaceOnboardingCompleted(db, workspaceId)
      }
    }
  }
  res.send()
}
