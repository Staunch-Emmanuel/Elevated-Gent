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

interface AuthResult {
  success: boolean
  error?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  subscriptionStatus: SubscriptionStatus
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, displayName?: string) => Promise<AuthResult>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getFriendlyAuthError(error: unknown): string {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
      ? (error as { code: string }).code
      : ''

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Incorrect email or password.'

    case 'auth/user-not-found':
      return 'No account found with this email.'

    case 'auth/invalid-email':
      return 'Please enter a valid email address.'

    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'

    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'

    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.'

    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.'

    default:
      return 'Something went wrong. Please try again.'
  }
}

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

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      await ensureUserDoc(credential.user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: getFriendlyAuthError(error),
      }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<AuthResult> => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)

      if (displayName) {
        await updateProfile(credential.user, { displayName })
      }

      await ensureUserDoc(credential.user)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: getFriendlyAuthError(error),
      }
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: getFriendlyAuthError(error),
      }
    }
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