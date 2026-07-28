import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

// Service prices (in cents)
export const SERVICE_PRICES = {
  'foundation-package': {
    name: 'The Foundation Package',
    price: 50000, // $500.00
    description:
      'Seasonal lookbook (5 curated outfits) + personal shopping + 1 month support',
  },
  'signature-refresh': {
    name: 'The Signature Refresh',
    price: 75000, // $750.00
    description:
      '30min consultation + seasonal lookbook (10 outfits) + shopping + support',
  },
  'gentlemens-upgrade': {
    name: "The Gentlemen's Upgrade",
    price: 100000, // $1000.00
    description:
      '1hr consultation + full lookbook (20 outfits) + shopping + support + try-on session',
  },
  'monthly-subscription': {
    name: 'Monthly Subscription',
    price: 1500, // $15.00
    description:
      'Access to all styling services, curated collections, and exclusive content',
  },
} as const

export type ServiceType = keyof typeof SERVICE_PRICES