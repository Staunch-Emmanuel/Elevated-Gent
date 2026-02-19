// src/app/subscribe/page.tsx
'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { SERVICE_PRICES } from '@/lib/stripe/client'

export default function SubscribePage() {
  const [loading, setLoading] = useState(false)

  const monthly = SERVICE_PRICES['monthly-subscription']

  const displayPrice = useMemo(() => {
    const cents = typeof monthly?.price === 'number' ? monthly.price : 0
    const dollars = cents / 100

    // Keep it simple so it matches Mark UI exactly
    if (!Number.isFinite(dollars) || dollars <= 0) return '$0'
    if (Number.isInteger(dollars)) return `$${dollars}`
    return `$${dollars.toFixed(2)}`
  }, [monthly?.price])

  const handleSubscribe = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Checkout failed')
      }

      const data = await res.json()

      if (!data?.url) {
        throw new Error('No checkout URL returned')
      }

      window.location.href = data.url
    } catch (err) {
      console.error(err)
      alert('Unable to start checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/Image-10.jpeg"
          alt="Elevated Gentleman"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Modal (Mark style) */}
      <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-lg max-w-md w-full p-8 shadow-xl relative">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-semibold font-sans">
              Welcome to The Elevated Gentleman
            </h1>

            {/* Description */}
            <p className="font-serif text-gray-600">
              Subscribe for just {displayPrice}/month to unlock premium styling
              services, curated collections, and exclusive content.
            </p>

            {/* Price */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-4xl font-semibold mb-2">
                {displayPrice}
              </div>
              <div className="text-sm text-gray-600 font-serif">
                per month
              </div>
            </div>

            {/* Benefits */}
            <ul className="text-left space-y-3 text-sm font-serif">
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Access to all styling services</span>
              </li>

              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Weekly curated fashion collections</span>
              </li>

              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Exclusive wellness & grooming tips</span>
              </li>

              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Priority customer support</span>
              </li>
            </ul>

            {/* Button */}
            <div className="space-y-3">
              <Button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-3"
              >
                {loading ? 'Processing...' : 'Subscribe Now'}
              </Button>

              <Link
                href="/auth/signin"
                className="block text-sm text-gray-600 hover:text-black"
              >
                Already subscribed? Login
              </Link>
            </div>

            <p className="text-xs text-gray-500 font-serif">
              Cancel anytime. No long-term commitment required.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
