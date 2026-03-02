import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[Stripe] STRIPE_SECRET_KEY is not set. Billing endpoints will not work.')
}

export const stripe =
  process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

/**
 * Get or create a Stripe customer by email. Used for workspace billing.
 */
export async function getOrCreateCustomerByEmail(email) {
  if (!stripe) throw new Error('Stripe is not configured on the server.')
  const trimmed = (email || '').trim().toLowerCase()
  if (!trimmed) throw new Error('Email is required to look up Stripe customer.')
  const existing = await stripe.customers.list({ email: trimmed, limit: 1 })
  if (existing.data.length > 0) return existing.data[0]
  return stripe.customers.create({ email: trimmed })
}
