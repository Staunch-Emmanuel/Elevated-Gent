'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

interface AuthContextValue {
  user: User | null
  loading: boolean
  access: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  access: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [access, setAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setAccess(false)
        setLoading(false)
        return
      }

      setUser(firebaseUser)

      const ref = doc(db, 'users', firebaseUser.uid)
      const snap = await getDoc(ref)

      if (!snap.exists()) {
        await setDoc(ref, {
          email: firebaseUser.email,
          access: false,
          createdAt: new Date(),
        })
        setAccess(false)
      } else {
        setAccess(Boolean(snap.data().access))
      }

      setLoading(false)
    })

    return () => unsub()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, access }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
