'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SubscribeSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const sessionId = searchParams.get('session_id')

    if (sessionId) {
      localStorage.setItem('eg_checkout_session_id', sessionId)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-3xl font-semibold mb-4">
        Payment Successful 🎉
      </h1>

      <p className="text-gray-600 mb-8">
        Create an account or login to activate your subscription.
      </p>

      <div className="space-y-4 w-full max-w-sm">
        <Link
          href="/auth/signup"
          className="block w-full bg-black text-white py-3 rounded"
        >
          Create Account
        </Link>

        <Link
          href="/auth/signin"
          className="block w-full border border-black py-3 rounded"
        >
          Login
        </Link>
      </div>
    </div>
  )
}
