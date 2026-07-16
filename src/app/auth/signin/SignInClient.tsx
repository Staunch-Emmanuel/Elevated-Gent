'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/firebase/auth'
import { Button } from '@/components/ui'
import { PagePadding, Container } from '@/components/layout'
import AuthMediaPanel from '@/components/auth/AuthMediaPanel'

export default function SignInClient() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (loading) return

    setError('')

    const trimmedEmail = email.trim()
    const trimmedPassword = password

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)

    try {
      const result = await signIn(trimmedEmail, trimmedPassword)

      if (!result || result.success !== true) {
        setError(result?.error || 'Incorrect email or password.')
        return
      }

      router.push('/home')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1d1c16] lg:flex lg:bg-[#8b8773]">
      <AuthMediaPanel />

      <div className="relative z-10 flex w-full flex-col justify-center lg:w-1/2">
        <PagePadding>
          <Container size="small">
            <div className="flex min-h-screen flex-col items-center justify-center py-12">
              <div className="w-full max-w-md">
                <div className="border border-[#d8cdbd] bg-[#f8f1e5] p-6 text-[#24231d] shadow-[0_24px_70px_rgba(24,23,17,0.24)] sm:p-8">
                  <div className="mb-8 text-center">
                    <h1 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[#24231d]">
                      Welcome Back
                    </h1>

                    <p className="mt-3 font-serif text-base leading-7 text-[#575348]">
                      Sign in to access your styling services
                    </p>
                  </div>

                  {error ? (
                    <div
                      className="mb-6 border border-[#d9aaa4] bg-[#fbefed] p-4"
                      role="alert"
                      aria-live="polite"
                    >
                      <p className="font-serif text-sm text-[#913a32]">
                        {error}
                      </p>
                    </div>
                  ) : null}

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    noValidate
                  >
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block font-serif text-sm font-medium text-[#4f4b3b]"
                      >
                        Email Address
                      </label>

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="w-full border border-[#b9ae9d] bg-[#f2eadf] px-4 py-3 font-serif text-[#24231d] outline-none transition-colors placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="mb-2 block font-serif text-sm font-medium text-[#4f4b3b]"
                      >
                        Password
                      </label>

                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="w-full border border-[#b9ae9d] bg-[#f2eadf] px-4 py-3 font-serif text-[#24231d] outline-none transition-colors placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                        placeholder="Enter your password"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3"
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <Link
                      href="/auth/forgot-password"
                      className="font-serif text-sm font-medium text-[#575348] transition-colors hover:text-[#24231d]"
                    >
                      Forgot your password?
                    </Link>
                  </div>

                  <div className="mt-8 border-t border-[#d8cdbd] pt-6">
                    <p className="text-center font-serif text-sm text-[#575348]">
                      Don&apos;t have an account?{' '}
                      <Link
                        href="/auth/signup"
                        className="font-semibold text-[#24231d] hover:underline"
                      >
                        Create Account
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="mt-6 text-center lg:mt-8">
                  <p className="font-serif text-sm leading-6 text-[#3f3c33]">
                    Access your personalized styling services, appointments,
                    and order history.
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