'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'

import {
  createUser,
  type UserRecord,
  type UserRole,
  type SubscriptionStatus,
} from '@/lib/firebase/users'

export default function NewUserPage() {
  const router = useRouter()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [user, setUser] = useState<Partial<UserRecord>>({
    email: '',
    role: 'subscriber' as UserRole,
    subscriptionStatus: 'inactive' as SubscriptionStatus,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const email = (user.email ?? '').trim()

      if (!email) {
        setError('Email is required.')
        setSaving(false)
        return
      }

      const uid = crypto.randomUUID()

      await createUser(uid, {
        email,
        role: (user.role ?? 'subscriber') as UserRole,
        subscriptionStatus: (user.subscriptionStatus ??
          'inactive') as SubscriptionStatus,
      })

      router.push('/admin/users')
    } catch (err: any) {
      console.error(err)
      setError(err?.message ?? 'Failed to create user.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container className="max-w-4xl py-10 md:py-12">
          <div className="mb-8 flex flex-col gap-5 border border-[#c8bcaa] bg-[#f2eadf] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.07)] sm:p-8 md:flex-row md:items-center md:justify-between">
            <h1 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[#24231d]">
              New User
            </h1>

            <button
              type="button"
              onClick={() => router.push('/admin/users')}
              className="inline-flex min-h-12 items-center justify-center border border-[#77725d] bg-transparent px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#4f4b3b] transition-colors hover:bg-[#4f4b3b] hover:text-[#f8f1e5]"
            >
              Back
            </button>
          </div>

          {error ? (
            <div className="mb-6 border border-[#d9aaa4] bg-[#fbefed] px-4 py-3 font-serif text-sm text-[#913a32]">
              {error}
            </div>
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
                value={user.email ?? ''}
                onChange={(e) =>
                  setUser((previous) => ({
                    ...previous,
                    email: e.target.value,
                  }))
                }
                className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 transition-colors hover:border-[#77725d] focus:border-[#4f4b3b]"
                placeholder="user@example.com"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                  Role
                </label>

                <select
                  value={(user.role ?? 'subscriber') as unknown as string}
                  onChange={(e) =>
                    setUser((previous) => ({
                      ...previous,
                      role: e.target.value as UserRole,
                    }))
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
                  value={
                    (user.subscriptionStatus ??
                      'inactive') as unknown as string
                  }
                  onChange={(e) =>
                    setUser((previous) => ({
                      ...previous,
                      subscriptionStatus:
                        e.target.value as SubscriptionStatus,
                    }))
                  }
                  className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none transition-colors hover:border-[#77725d] focus:border-[#4f4b3b]"
                >
                  <option value="trialing">Trialing</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
            </div>

            <div className="border-t border-[#c8bcaa] pt-6">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-12 items-center justify-center border border-[#4f4b3b] bg-[#4f4b3b] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#f8f1e5] transition-colors hover:bg-transparent hover:text-[#4f4b3b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Create User'}
              </button>
            </div>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}