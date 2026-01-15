import { getAuth } from 'firebase/auth'

export async function ensureUserDoc() {
  const user = getAuth().currentUser
  if (!user) return { ok: false, reason: 'no-user' }

  const token = await user.getIdToken()

  const res = await fetch('/api/auth/ensure-user', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data?.error || 'Failed to create user profile document')
  }

  return data
}
