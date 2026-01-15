'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui'

export default function SubscribePage() {
  const [loading, setLoading] = useState(false)

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
        const err = await res.json()
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
    <div className="min-h-screen flex">
      {/* Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="/images/Image-10.jpeg"
          alt="Elevated Gentleman"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white border rounded-xl p-8 shadow-xl text-center">
          <h1 className="text-5xl font-bold mb-2">$2</h1>
          <p className="text-gray-600 mb-6">
            Monthly access to Elevated Gentleman
          </p>

          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-3 text-lg mb-4"
          >
            {loading ? 'Redirecting…' : 'Subscribe'}
          </Button>

          <Link
            href="/auth/signin"
            className="block text-sm text-gray-600 hover:text-black"
          >
            Already subscribed? Login
          </Link>
        </div>
      </div>
    </div>
  )
}
