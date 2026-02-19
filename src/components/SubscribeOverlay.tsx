'use client'

import { useState } from 'react'

export default function SubscribeOverlay() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              name: 'The Elevated Gentleman',
              description: 'Full access membership',
              price: 7,
              quantity: 1,
            },
          ],
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Checkout failed')
      }

      const data = await res.json()

      if (!data.url) {
        throw new Error('No checkout URL returned')
      }

      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleLogin = () => {
    window.location.href = '/login'
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white text-black rounded-2xl p-10 max-w-md w-full text-center space-y-6 shadow-2xl">

        <h2 className="text-3xl font-semibold">
          The Elevated Gentleman
        </h2>

        <div className="flex items-end justify-center gap-2">
          <span className="text-6xl font-bold">$2</span>
          <span className="text-sm mb-2 opacity-70">one-time</span>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full py-4 text-lg bg-black text-white rounded-xl disabled:opacity-50"
        >
          {loading ? 'Redirecting…' : 'Subscribe'}
        </button>

        <button
          onClick={handleLogin}
          className="w-full py-4 text-base border-2 border-black rounded-xl"
        >
          Login
        </button>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  )
}
