import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

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
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const userData = userDoc.data() || {}
    const stripeCustomerId =
      typeof userData.stripeCustomerId === 'string'
        ? userData.stripeCustomerId
        : null

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found for this account' },
        { status: 400 }
      )
    }

    const baseUrl = resolveBaseUrl(request)

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${baseUrl}/account`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('CUSTOMER PORTAL ERROR:', error)

    return NextResponse.json(
      { error: error.message || 'Unable to create customer portal session' },
      { status: 500 }
    )
  }
}