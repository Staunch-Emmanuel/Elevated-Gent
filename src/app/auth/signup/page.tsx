'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { useAuth } from '@/lib/firebase/auth'
import { Button } from '@/components/ui'
import { PagePadding, Container } from '@/components/layout'
import AuthMediaPanel from '@/components/auth/AuthMediaPanel'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedEmail = email.trim()
    const trimmedFirstName = firstName.trim()
    const trimmedLastName = lastName.trim()

    if (!trimmedFirstName || !trimmedLastName) {
      setError('Please enter your first and last name.')
      return
    }

    if (!trimmedEmail) {
      setError('Please enter your email address.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      const displayName = `${trimmedFirstName} ${trimmedLastName}`.trim()
      const result = await signUp(trimmedEmail, password, displayName)

      if (!result.success) {
        setError(result.error || 'Failed to create account.')
        return
      }

      router.push('/account?signup=success')
    } catch {
      setError('Failed to create account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-eg-espresso-deep)] lg:flex lg:bg-[var(--color-eg-paper)]">
      <AuthMediaPanel />

      <div className="relative z-10 flex w-full flex-col justify-center lg:w-1/2">
        <PagePadding>
          <Container size="small">
            <div className="flex min-h-screen flex-col items-center justify-center py-12">
              <div className="w-full max-w-md">
                <div className="border border-[rgba(232,235,236,0.28)] bg-[rgba(232,235,236,0.96)] p-6 text-[var(--color-eg-ink)] shadow-[0_24px_70px_rgba(24,23,17,0.24)] backdrop-blur-sm sm:p-8 lg:border-[var(--color-eg-line)] lg:bg-[var(--color-eg-cream)] lg:backdrop-blur-0">
                  <div className="mb-8 text-center">
                    <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-eg-muted)]">
                      Become a Member
                    </p>

                    <h1 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[var(--color-eg-ink)]">
                      Create Account
                    </h1>

                    <p className="mt-3 font-serif leading-7 text-[var(--color-eg-muted)]">
                      Join us for personalized styling services
                    </p>
                  </div>

                  <div className="mb-8 border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] p-5 text-center">
                    <p className="font-editorial text-2xl font-normal text-[var(--color-eg-espresso-deep)]">
                      Membership — $15/month
                    </p>

                    <p className="mt-2 font-serif text-sm leading-6 text-[var(--color-eg-muted)]">
                      Access exclusive articles, outfit inspiration, weekly
                      finds, and premium member content.
                    </p>
                  </div>

                  {error ? (
                    <div className="mb-6 border border-[#d9aaa4] bg-[#fbefed] p-4">
                      <p className="font-serif text-sm text-[#913a32]">
                        {error}
                      </p>
                    </div>
                  ) : null}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)]"
                        >
                          First Name
                        </label>

                        <input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="w-full border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] px-4 py-3 font-serif text-[var(--color-eg-ink)] outline-none transition-colors placeholder:text-[rgba(98,94,83,0.68)] hover:border-[var(--color-eg-espresso-soft)] focus:border-[var(--color-eg-espresso-deep)]"
                          placeholder="John"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="lastName"
                          className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)]"
                        >
                          Last Name
                        </label>

                        <input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="w-full border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] px-4 py-3 font-serif text-[var(--color-eg-ink)] outline-none transition-colors placeholder:text-[rgba(98,94,83,0.68)] hover:border-[var(--color-eg-espresso-soft)] focus:border-[var(--color-eg-espresso-deep)]"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

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

                    <div>
                      <label
                        htmlFor="password"
                        className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)]"
                      >
                        Password
                      </label>

                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] px-4 py-3 font-serif text-[var(--color-eg-ink)] outline-none transition-colors placeholder:text-[rgba(98,94,83,0.68)] hover:border-[var(--color-eg-espresso-soft)] focus:border-[var(--color-eg-espresso-deep)]"
                        placeholder="At least 6 characters"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)]"
                      >
                        Confirm Password
                      </label>

                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] px-4 py-3 font-serif text-[var(--color-eg-ink)] outline-none transition-colors placeholder:text-[rgba(98,94,83,0.68)] hover:border-[var(--color-eg-espresso-soft)] focus:border-[var(--color-eg-espresso-deep)]"
                        placeholder="Confirm your password"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3"
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>

                  <div className="mt-8 border-t border-[var(--color-eg-line)] pt-6">
                    <p className="text-center font-serif text-sm text-[var(--color-eg-muted)]">
                      Already have an account?{' '}
                      <Link
                        href="/auth/signin"
                        className="font-semibold text-[var(--color-eg-espresso-deep)] hover:underline"
                      >
                        Sign In
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="mt-6 text-center lg:mt-8">
                  <p className="font-serif text-sm leading-6 text-[rgba(232,235,236,0.88)] lg:text-[var(--color-eg-muted)]">
                    Create your account to access personalized styling services
                    and curated products.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </PagePadding>
      </div>
    </div>
  )
}