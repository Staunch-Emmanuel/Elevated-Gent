// src/app/api/stripe/create-payment-intent/route.ts

import Stripe from 'stripe'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY env var.')
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const serviceType = String(body.serviceType || '')
    const customerEmail = body.customerEmail
      ? String(body.customerEmail)
      : null
    const firebaseUid = body.firebaseUid
      ? String(body.firebaseUid)
      : null

    if (!serviceType) {
      return NextResponse.json(
        { error: 'Missing serviceType' },
        { status: 400 }
      )
    }

    const SERVICE_PRICES = {
      'foundation-package': 50000,
      'signature-refresh': 75000,
      'gentlemens-upgrade': 100000,
      'monthly-subscription': 1500, // $15.00 in cents
    } as const

    const amount =
      SERVICE_PRICES[serviceType as keyof typeof SERVICE_PRICES]

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Invalid serviceType pricing' },
        { status: 400 }
      )
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: customerEmail || undefined,
      metadata: {
        serviceType,
        firebaseUid: firebaseUid || '',
        customerEmail: customerEmail || '',
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error: unknown) {
    console.error(
      'create-payment-intent error:',
      error instanceof Error ? error.message : error
    )

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}