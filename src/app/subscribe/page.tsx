'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { SERVICE_PRICES } from '@/lib/stripe/client'
import { useAuth } from '@/lib/firebase/auth'

export default function SubscribePage() {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const monthly = SERVICE_PRICES['monthly-subscription']

  const displayPrice = useMemo(() => {
    const cents = typeof monthly?.price === 'number' ? monthly.price : 0
    const dollars = cents / 100

    if (!Number.isFinite(dollars) || dollars <= 0) return '$0'
    if (Number.isInteger(dollars)) return `$${dollars}`
    return `$${dollars.toFixed(2)}`
  }, [monthly?.price])

  const handleSubscribe = async () => {
    if (!user) {
      window.location.href = '/auth/signin?next=/subscribe'
      return
    }

    setLoading(true)

    try {
      const token = await user.getIdToken()

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceType: 'monthly-subscription',
        }),
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
    <div className="relative min-h-screen bg-[#1d1c16]">
      <div className="absolute inset-0">
        <Image
          src="/images/Image-10.jpeg"
          alt="Elevated Gentleman"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-[rgba(24,23,17,0.76)]" />
      </div>

      <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[rgba(24,23,17,0.76)] p-4 backdrop-blur-sm sm:p-6">
        <div className="relative my-auto w-full max-w-lg border border-[#817E6C] bg-[#E8EBEC] p-6 text-[#24231d] shadow-[0_28px_80px_rgba(24,23,17,0.42)] sm:p-8">
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#24231d]">
              <svg
                className="h-8 w-8 text-[#E8EBEC]"
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

            <h1 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[#24231d]">
              Welcome to The Elevated Gentleman
            </h1>

            <p className="font-serif text-base leading-7 text-[#575348]">
              Subscribe for just {displayPrice}/month to unlock premium styling
              services, curated collections, and exclusive content.
            </p>

            <div className="border border-[#817E6C] bg-[#E8EBEC] p-6">
              <div className="font-editorial text-5xl font-normal text-[#817E6C]">
                {displayPrice}
              </div>

              <div className="mt-1 font-serif text-sm text-[#575348]">
                per month
              </div>
            </div>

            <ul className="space-y-3 text-left font-serif text-sm leading-6 text-[#817E6C]">
              <li className="flex items-start">
                <svg
                  className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-[#3f6f3f]"
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
                  className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-[#3f6f3f]"
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
                  className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-[#3f6f3f]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>

                <span>Exclusive wellness &amp; grooming tips</span>
              </li>

              <li className="flex items-start">
                <svg
                  className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-[#3f6f3f]"
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

            <div className="space-y-4 border-t border-[#817E6C] pt-6">
              <Button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-3"
              >
                {loading ? 'Processing...' : 'Subscribe Now'}
              </Button>

              <Link
                href="/auth/signin"
                className="block font-serif text-sm font-medium text-[#817E6C] transition-colors hover:text-[#24231d]"
              >
                Already subscribed? Login
              </Link>
            </div>

            <p className="font-serif text-xs text-[#625e53]">
              Cancel anytime. No long-term commitment required.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}