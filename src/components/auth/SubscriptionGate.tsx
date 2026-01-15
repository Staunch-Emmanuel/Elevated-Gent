'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { linkStripeSubscriptionToUser } from '@/lib/firebase/linkSubscription'

export default function SubscriptionGate({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/subscribe");
        return
      }

      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)

      // If user doc doesn't exist yet, wait
      if (!userSnap.exists()) {
        setLoading(false)
        return
      }

      const data = userSnap.data()

      // ✅ If active, allow
      if (data.subscriptionStatus === 'active') {
        setLoading(false)
        return
      }

      // 🟡 If checkout session exists, attempt linking ONCE
      const sessionId = localStorage.getItem('eg_checkout_session_id')
      if (sessionId) {
        await linkStripeSubscriptionToUser(user.uid)
        setLoading(false)
        return
      }

      // ❌ No active subscription and no session → redirect
      router.push('/subscribe')
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking subscription…</p>
      </div>
    )
  }

  return <>{children}</>
}
