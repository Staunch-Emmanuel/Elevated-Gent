'use client'

import { useEffect, useMemo, useState, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'

import { getUserById, updateUserById } from '@/lib/firebase/users'

type UserRole = 'admin' | 'subscriber'

type SubscriptionStatus =
  | 'active'
  | 'inactive'
  | 'trialing'
  | 'canceled'
  | 'past_due'

type UserRecord = {
  id: string
  email?: string
  role?: UserRole
  subscriptionStatus?: SubscriptionStatus
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  createdAt?: any
  updatedAt?: any
}

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()

  const userId = useMemo(() => {
    const raw = (params as any)?.id
    return Array.isArray(raw) ? raw[0] : raw
  }, [params])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [user, setUser] = useState<UserRecord | null>(null)

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('subscriber')
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus>('inactive')
  const [stripeCustomerId, setStripeCustomerId] = useState('')
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState('')

  useEffect(() => {
    async function load() {
      if (!userId) return

      setLoading(true)
      setError('')

      try {
        const doc = (await getUserById(String(userId))) as any

        if (!doc) {
          setUser(null)
          setError('User not found.')
          setLoading(false)
          return
        }

        setUser(doc)

        setEmail(doc.email ?? '')
        setRole((doc.role as UserRole) ?? 'subscriber')
        setSubscriptionStatus(
          (doc.subscriptionStatus as SubscriptionStatus) ?? 'inactive'
        )
        setStripeCustomerId(doc.stripeCustomerId ?? '')
        setStripeSubscriptionId(doc.stripeSubscriptionId ?? '')
      } catch (e) {
        console.error(e)
        setError('Failed to load user.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [userId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!userId) return

    setSaving(true)
    setError('')

    try {
      await updateUserById(String(userId), {
        email,
        role,
        subscriptionStatus,
        stripeCustomerId,
        stripeSubscriptionId,
      })

      router.push('/admin/users')
    } catch (e) {
      console.error(e)
      setError('Failed to update user.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <PagePadding>
          <Container className="max-w-4xl py-10 md:py-12">
            <div className="border border-[#c8bcaa] bg-[#f2eadf] px-6 py-14 text-center shadow-[0_12px_32px_rgba(36,35,29,0.06)]">
              <p className="font-serif text-sm text-[#575348]">
                Loading...
              </p>
            </div>
          </Container>
        </PagePadding>
      </ProtectedRoute>
    )
  }

  if (!user) {
    return (
      <ProtectedRoute>
        <PagePadding>
          <Container className="max-w-4xl py-10 md:py-12">
            <div className="border border-[#c8bcaa] bg-[#f2eadf] px-6 py-14 text-center shadow-[0_12px_32px_rgba(36,35,29,0.06)]">
              <p className="font-serif text-sm text-[#575348]">
                User not found.
              </p>

              {error ? (
                <p className="mt-5 border border-[#d9aaa4] bg-[#fbefed] px-4 py-3 font-serif text-sm text-[#913a32]">
                  {error}
                </p>
              ) : null}
            </div>
          </Container>
        </PagePadding>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container className="max-w-4xl py-10 md:py-12">
          <div className="mb-8 flex flex-col gap-5 border border-[#c8bcaa] bg-[#f2eadf] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.07)] sm:p-8 md:flex-row md:items-center md:justify-between">
            <h1 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[#24231d]">
              Edit User
            </h1>

            <button
              onClick={() => router.push('/admin/users')}
              className="inline-flex min-h-12 items-center justify-center border border-[#77725d] bg-transparent px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#4f4b3b] transition-colors hover:bg-[#4f4b3b] hover:text-[#f8f1e5]"
            >
              Back
            </button>
          </div>

          {error ? (
            <p className="mb-6 border border-[#d9aaa4] bg-[#fbefed] px-4 py-3 font-serif text-sm text-[#913a32]">
              {error}
            </p>
          ) : null}

          <form
            onSubmit={handleSubmit}
            className="space-y-7 border border-[#c8bcaa] bg-[#f2eadf] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.06)] sm:p-8"
          >
            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                Email
              </label>

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 transition-colors hover:border-[#77725d] focus:border-[#4f4b3b]"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                  Role
                </label>

                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as UserRole)
                  }
                  className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none transition-colors hover:border-[#77725d] focus:border-[#4f4b3b]"
                >
                  <option value="subscriber">Subscriber</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                  Subscription Status
                </label>

                <select
                  value={subscriptionStatus}
                  onChange={(e) =>
                    setSubscriptionStatus(
                      e.target.value as SubscriptionStatus
                    )
                  }
                  className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none transition-colors hover:border-[#77725d] focus:border-[#4f4b3b]"
                >
                  <option value="inactive">Inactive</option>
                  <option value="active">Active</option>
                  <option value="trialing">Trialing</option>
                  <option value="canceled">Canceled</option>
                  <option value="past_due">Past Due</option>
                </select>
              </div>
            </div>

            <div className="space-y-5 border border-[#d2c6b5] bg-[#e9dfd1] p-5 sm:p-6">
              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                  Stripe Customer ID
                </label>

                <input
                  value={stripeCustomerId}
                  onChange={(e) =>
                    setStripeCustomerId(e.target.value)
                  }
                  className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-mono text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 transition-colors hover:border-[#77725d] focus:border-[#4f4b3b]"
                />
              </div>

              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                  Stripe Subscription ID
                </label>

                <input
                  value={stripeSubscriptionId}
                  onChange={(e) =>
                    setStripeSubscriptionId(e.target.value)
                  }
                  className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-mono text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 transition-colors hover:border-[#77725d] focus:border-[#4f4b3b]"
                />
              </div>
            </div>

            <div className="border-t border-[#c8bcaa] pt-6">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-12 items-center justify-center border border-[#4f4b3b] bg-[#4f4b3b] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#f8f1e5] transition-colors hover:bg-transparent hover:text-[#4f4b3b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}