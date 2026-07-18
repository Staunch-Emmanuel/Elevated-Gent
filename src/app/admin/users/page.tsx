'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import {
  getAllUsers,
  deleteUser,
  UserRecord,
} from '@/lib/firebase/users'

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getAllUsers()
      setUsers(data)
      setLoading(false)
    }

    load()
  }, [])

  async function handleDelete(uid: string) {
    if (!confirm('Delete this user?')) return

    await deleteUser(uid)
    setUsers((prev) => prev.filter((u) => u.uid !== uid))
  }

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <PagePadding>
          <Container className="max-w-6xl py-10 md:py-12">
            <div className="border border-[#c8bcaa] bg-[#f2eadf] px-6 py-14 text-center shadow-[0_12px_32px_rgba(36,35,29,0.06)]">
              <p className="font-serif text-sm text-[#575348]">
                Loading users...
              </p>
            </div>
          </Container>
        </PagePadding>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAdmin>
      <PagePadding>
        <Container className="max-w-6xl py-10 md:py-12">
          <div className="mb-8 flex flex-col gap-5 border border-[#c8bcaa] bg-[#f2eadf] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.07)] sm:p-8 md:flex-row md:items-center md:justify-between">
            <h1 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[#24231d]">
              Users
            </h1>

            <Link
              href="/admin/users/new"
              className="inline-flex min-h-12 items-center justify-center border border-[#4f4b3b] bg-[#4f4b3b] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#f8f1e5] transition-colors hover:bg-transparent hover:text-[#4f4b3b]"
            >
              + New User
            </Link>
          </div>

          <div className="overflow-hidden border border-[#c8bcaa] bg-[#f2eadf] shadow-[0_14px_36px_rgba(36,35,29,0.06)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-[#68634f] bg-[#77725d] text-[#f8f1e5]">
                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em]">
                      Email
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em]">
                      Role
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em]">
                      Subscription
                    </th>

                    <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.12em]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.uid}
                      className="border-b border-[#d2c6b5] bg-[#f2eadf] transition-colors last:border-b-0 hover:bg-[#e9dfd1]"
                    >
                      <td className="px-5 py-5 font-serif text-sm text-[#24231d]">
                        {user.email}
                      </td>

                      <td className="px-5 py-5">
                        <span className="inline-flex border border-[#b9ae9d] bg-[#e9dfd1] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4f4b3b]">
                          {user.role}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <span className="inline-flex border border-[#b9ae9d] bg-[#f8f1e5] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4f4b3b]">
                          {user.subscriptionStatus}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex justify-end gap-3">
                          <Link
                            href={`/admin/users/${user.uid}`}
                            className="border border-[#77725d] bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#4f4b3b] transition-colors hover:bg-[#4f4b3b] hover:text-[#f8f1e5]"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(user.uid)}
                            className="border border-[#a65a50] bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#913a32] transition-colors hover:bg-[#913a32] hover:text-[#f8f1e5]"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-14 text-center font-serif text-sm text-[#575348]"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}