'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from '@/lib/firebase/auth'
import { db } from '@/lib/firebase/config'

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function verify() {
      if (!user) return

      const ref = doc(db, 'users', user.uid)
      const snap = await getDoc(ref)

      if (!snap.exists() || snap.data().role !== 'admin') {
        router.replace('/')
        return
      }

      setChecking(false)
    }

    if (!loading && user) verify()
  }, [user, loading, router])

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Verifying admin access…
      </div>
    )
  }

  return <>{children}</>
}
