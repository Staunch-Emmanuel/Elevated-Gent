// src/lib/firebase/auth.tsx
'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from 'firebase/auth'

import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { ensureUserDoc } from '@/lib/auth/ensureUserDoc'
import type { SubscriptionStatus } from '@/lib/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  subscriptionStatus: SubscriptionStatus
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (!firebaseUser) {
        setSubscriptionStatus(null)
        setLoading(false)
        return
      }

      try {
        await ensureUserDoc(firebaseUser)

        const userRef = doc(db, 'users', firebaseUser.uid)
        const snap = await getDoc(userRef)

        if (snap.exists()) {
          setSubscriptionStatus(
            (snap.data().subscriptionStatus as SubscriptionStatus) ?? null
          )
        } else {
          setSubscriptionStatus(null)
        }
      } catch (e) {
        console.error('Auth init error:', e)
        setSubscriptionStatus(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    await ensureUserDoc(credential.user)
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password)

    if (displayName) {
      await updateProfile(credential.user, { displayName })
    }

    await ensureUserDoc(credential.user)
  }

  const logout = async () => {
    await signOut(auth)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        subscriptionStatus,
        signIn,
        signUp,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
