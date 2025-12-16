'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/firebase/auth'

interface Props {
  children: React.ReactNode
}

export default function SubscriptionGate({ children }: Props) {
  const { user, loading, access } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    // Not logged in → login
    if (!user) {
      if (pathname !== '/login') {
        router.replace('/login')
      }
      return
    }

    // Logged in but no access → subscribe
    if (!access) {
      if (pathname !== '/subscribe') {
        router.replace('/subscribe')
      }
      return
    }
  }, [user, loading, access, router, pathname])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-sm">
        Loading…
      </div>
    )
  }

  // While redirecting
  if (!user || !access) {
    return null
  }

  return <>{children}</>
}
