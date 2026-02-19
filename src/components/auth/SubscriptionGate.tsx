// src/components/auth/SubscriptionGate.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { ensureUserDoc } from '@/lib/auth/ensureUserDoc'
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
        router.replace('/subscribe')
        return
      }

      try {
        // ✅ Always ensure the Firestore users/{uid} doc exists
        await ensureUserDoc(user)

        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
          // If something is seriously wrong, keep them blocked and send to subscribe
          router.replace('/subscribe')
          return
        }

        const data = userSnap.data()

        if (data.subscriptionStatus === 'active') {
          setLoading(false)
          return
        }

        const sessionId = localStorage.getItem('eg_checkout_session_id')
        if (sessionId) {
          await linkStripeSubscriptionToUser(user.uid)

          const refreshed = await getDoc(userRef)
          const refreshedData = refreshed.exists() ? refreshed.data() : null

          if (refreshedData?.subscriptionStatus === 'active') {
            setLoading(false)
            return
          }
        }

        router.replace('/subscribe')
      } catch (e) {
        console.error('SubscriptionGate error:', e)
        router.replace('/subscribe')
      } finally {
        setLoading(false)
      }
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
