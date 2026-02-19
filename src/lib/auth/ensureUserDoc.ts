// src/lib/auth/ensureUserDoc.ts
'use client'

import { auth, db } from '@/lib/firebase/config'
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import type { User } from 'firebase/auth'
import type { SubscriptionStatus } from '@/lib/types'

type UserRole = 'admin' | 'subscriber'

type UserDoc = {
  uid: string
  email: string | null
  displayName: string | null
  role: UserRole
  subscriptionStatus: SubscriptionStatus
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  createdAt?: unknown
  updatedAt?: unknown
}

/**
 * Ensures Firestore has a users/{uid} doc.
 * - Creates it if missing
 * - Never overwrites role or subscriptionStatus if they already exist
 * - Adds missing baseline fields safely
 */
export async function ensureUserDoc(passedUser?: User): Promise<void> {
  const user = passedUser ?? auth.currentUser
  if (!user) return

  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    const payload: UserDoc = {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      role: 'subscriber',
      subscriptionStatus: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(ref, payload, { merge: true })
    return
  }

  const data = snap.data() as Partial<UserDoc>

  const updates: Partial<UserDoc> = {
    updatedAt: serverTimestamp(),
  }

  if (!('uid' in data)) updates.uid = user.uid
  if (!('email' in data)) updates.email = user.email ?? null
  if (!('displayName' in data)) updates.displayName = user.displayName ?? null

  if (!('role' in data) || !data.role) updates.role = 'subscriber'

  if (!('subscriptionStatus' in data)) updates.subscriptionStatus = null

  if (!('stripeCustomerId' in data)) updates.stripeCustomerId = null
  if (!('stripeSubscriptionId' in data)) updates.stripeSubscriptionId = null

  const keys = Object.keys(updates)
  if (keys.length > 1) {
    await updateDoc(ref, updates)
  } else {
    await updateDoc(ref, { updatedAt: serverTimestamp() })
  }
}
