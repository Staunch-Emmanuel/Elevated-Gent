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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(24,23,17,0.82)] px-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-7 border border-[rgba(232,235,236,0.28)] bg-[var(--color-eg-cream)] p-7 text-center text-[var(--color-eg-ink)] shadow-[0_28px_80px_rgba(24,23,17,0.42)] sm:p-10">
        <div>
          <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--color-eg-muted)]">
            Premium Membership
          </p>

          <h2 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[var(--color-eg-ink)]">
            The Elevated Gentleman
          </h2>
        </div>

        <div className="border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] p-6">
          <div className="flex items-end justify-center gap-2">
            <span className="font-editorial text-6xl font-normal text-[var(--color-eg-espresso-deep)]">
              $2
            </span>

            <span className="mb-2 font-serif text-sm text-[var(--color-eg-muted)]">
              one-time
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full border border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] px-6 py-4 font-sans text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-cream)] transition-colors hover:bg-transparent hover:text-[var(--color-eg-espresso-deep)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Redirecting…' : 'Subscribe'}
          </button>

          <button
            onClick={handleLogin}
            className="w-full border border-[var(--color-eg-espresso-deep)] bg-transparent px-6 py-4 font-sans text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)] transition-colors hover:bg-[var(--color-eg-espresso-deep)] hover:text-[var(--color-eg-cream)]"
          >
            Login
          </button>
        </div>

        {error && (
          <div className="border border-[#d9aaa4] bg-[#fbefed] p-4">
            <p className="font-serif text-sm text-[#913a32]">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}