'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/lib/firebase/auth'
import { Button } from '@/components/ui'
import { PagePadding, Container } from '@/components/layout'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await resetPassword(email)
      setMessage('Check your email for password reset instructions')
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : 'Failed to send reset email'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-eg-espresso-deep)] text-[var(--color-eg-cream)]">
      <PagePadding>
        <Container size="small">
          <div className="flex min-h-screen flex-col items-center justify-center py-12">
            {/* Company Logo */}
            <div className="mb-10">
              <div className="border border-[rgba(248,241,229,0.32)] bg-[rgba(248,241,229,0.94)] px-6 py-4 shadow-[0_12px_32px_rgba(24,23,17,0.18)]">
                <Image
                  src="/images/The Elevated gentleman.svg"
                  alt="The Elevated Gentleman"
                  width={330}
                  height={19}
                  className="h-8 w-auto"
                />
              </div>
            </div>

            {/* Forgot Password Form */}
            <div className="w-full max-w-md">
              <div className="border border-[rgba(248,241,229,0.28)] bg-[var(--color-eg-cream)] p-6 text-[var(--color-eg-ink)] shadow-[0_24px_70px_rgba(24,23,17,0.28)] sm:p-8">
                <div className="mb-8 text-center">
                  <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-eg-muted)]">
                    Account Recovery
                  </p>

                  <h1 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[var(--color-eg-ink)]">
                    Reset Password
                  </h1>

                  <p className="mt-3 font-serif leading-7 text-[var(--color-eg-muted)]">
                    Enter your email to receive reset instructions
                  </p>
                </div>

                {error && (
                  <div className="mb-6 border border-[#d9aaa4] bg-[#fbefed] p-4">
                    <p className="font-serif text-sm text-[#913a32]">
                      {error}
                    </p>
                  </div>
                )}

                {message && (
                  <div className="mb-6 border border-[#aebc98] bg-[#eef3e7] p-4">
                    <p className="font-serif text-sm text-[#40512f]">
                      {message}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)]"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] px-4 py-3 font-serif text-[var(--color-eg-ink)] outline-none transition-colors placeholder:text-[rgba(98,94,83,0.68)] hover:border-[var(--color-eg-espresso-soft)] focus:border-[var(--color-eg-espresso-deep)]"
                      placeholder="your@email.com"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3"
                  >
                    {loading ? 'Sending...' : 'Send Reset Email'}
                  </Button>
                </form>

                <div className="mt-8 space-y-4 border-t border-[var(--color-eg-line)] pt-6 text-center">
                  <Link
                    href="/auth/signin"
                    className="block font-serif text-sm text-[var(--color-eg-muted)] transition-colors hover:text-[var(--color-eg-espresso-deep)]"
                  >
                    ← Back to Sign In
                  </Link>

                  <p className="font-serif text-sm text-[var(--color-eg-muted)]">
                    Don&apos;t have an account?{' '}
                    <Link
                      href="/auth/signup"
                      className="font-semibold text-[var(--color-eg-espresso-deep)] hover:underline"
                    >
                      Create Account
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </PagePadding>
    </div>
  )
}