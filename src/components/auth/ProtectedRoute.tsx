'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/firebase/auth'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, access } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !access)) {
      router.replace('/subscribe')
    }
  }, [user, access, loading, router])

  if (loading || !user || !access) return null

  return <>{children}</>
}
