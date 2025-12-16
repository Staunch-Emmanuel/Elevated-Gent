// src/app/api/stripe/create-payment-intent/route.ts

import Stripe from 'stripe'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY env var.')
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const serviceType = String(body.serviceType || '')
    const customerEmail = body.customerEmail ? String(body.customerEmail) : null
    const firebaseUid = body.firebaseUid ? String(body.firebaseUid) : null

    if (!serviceType) {
      return NextResponse.json({ error: 'Missing serviceType' }, { status: 400 })
    }

    // IMPORTANT:
    // Your frontend pricing comes from SERVICE_PRICES.
    // Server should not trust arbitrary client amounts.
    // We will require that your server also references SERVICE_PRICES if you want strict enforcement.
    // For now (minimal), pass amount from your existing server-side config if present.
    //
    // If you already implemented amount mapping elsewhere, keep that logic.
    const SERVICE_PRICES = {
      'foundation-package': 25000,
      'signature-refresh': 50000,
      'gentlemens-upgrade': 75000,
      'monthly-subscription': 4200, // $42.00 in cents (UPDATE if your real amount differs)
    } as const

    const amount = (SERVICE_PRICES as any)[serviceType]

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Invalid serviceType pricing' }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      receipt_email: customerEmail || undefined,
      metadata: {
        serviceType,
        firebaseUid: firebaseUid || '',
        customerEmail: customerEmail || '',
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err: any) {
    console.error('create-payment-intent error:', err?.message || err)
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
  }
}
