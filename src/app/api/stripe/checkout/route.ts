import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { adminAuth, adminDb } from '@/lib/firebase/admin'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const monthlyPriceId = process.env.STRIPE_MONTHLY_PRICE_ID

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

if (!monthlyPriceId) {
  throw new Error('Missing STRIPE_MONTHLY_PRICE_ID environment variable')
}

const stripe = new Stripe(stripeSecretKey)

function resolveBaseUrl(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (appUrl) {
    return appUrl.replace(/\/+$/, '')
  }

  if (process.env.VERCEL_URL) {
    const vercelUrl = process.env.VERCEL_URL.trim()

    if (vercelUrl.startsWith('http')) {
      return vercelUrl.replace(/\/+$/, '')
    }

    return `https://${vercelUrl.replace(/\/+$/, '')}`
  }

  const origin = request.headers.get('origin')

  if (origin) {
    return origin.replace(/\/+$/, '')
  }

  throw new Error('Unable to determine app URL')
}

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get('authorization')

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization token')
  }

  return authorization.slice('Bearer '.length).trim()
}

export async function POST(request: NextRequest) {
  try {
    const token = getBearerToken(request)
    const decoded = await adminAuth.verifyIdToken(token)

    const userDoc = await adminDb.collection('users').doc(decoded.uid).get()

    if (!userDoc.exists) {
      throw new Error('User profile not found')
    }

    const userData = userDoc.data() || {}

    const email =
      decoded.email ||
      (typeof userData.email === 'string' ? userData.email : null)

    if (!email) {
      throw new Error('Authenticated user email is required')
    }

    const baseUrl = resolveBaseUrl(request)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      client_reference_id: decoded.uid,
      metadata: {
        appUid: decoded.uid,
        appEmail: email,
        serviceType: 'monthly-subscription',
      },
      line_items: [
        {
          price: monthlyPriceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscribe`,
    })

    if (!session.url) {
      return NextResponse.json(
        { error: 'Stripe did not return a checkout URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('STRIPE CHECKOUT ERROR:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to start checkout',
      },
      { status: 500 }
    )
  }
}