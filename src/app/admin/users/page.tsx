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
            <div className="border border-[#817E6C] bg-[#E8EBEC] px-6 py-14 text-center shadow-[0_12px_32px_rgba(36,35,29,0.06)]">
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
          <div className="mb-8 flex flex-col gap-5 border border-[#817E6C] bg-[#E8EBEC] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.07)] sm:p-8 md:flex-row md:items-center md:justify-between">
            <h1 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[#24231d]">
              Users
            </h1>

            <Link
              href="/admin/users/new"
              className="inline-flex min-h-12 items-center justify-center border border-[#817E6C] bg-[#817E6C] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#E8EBEC] transition-colors hover:bg-transparent hover:text-[#817E6C]"
            >
              + New User
            </Link>
          </div>

          <div className="overflow-hidden border border-[#817E6C] bg-[#E8EBEC] shadow-[0_14px_36px_rgba(36,35,29,0.06)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-[#817E6C] bg-[#817E6C] text-[#E8EBEC]">
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
                      className="border-b border-[#817E6C] bg-[#E8EBEC] transition-colors last:border-b-0 hover:bg-[#E8EBEC]"
                    >
                      <td className="px-5 py-5 font-serif text-sm text-[#24231d]">
                        {user.email}
                      </td>

                      <td className="px-5 py-5">
                        <span className="inline-flex border border-[#817E6C] bg-[#E8EBEC] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#817E6C]">
                          {user.role}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <span className="inline-flex border border-[#817E6C] bg-[#E8EBEC] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#817E6C]">
                          {user.subscriptionStatus}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex justify-end gap-3">
                          <Link
                            href={`/admin/users/${user.uid}`}
                            className="border border-[#817E6C] bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#817E6C] transition-colors hover:bg-[#817E6C] hover:text-[#E8EBEC]"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(user.uid)}
                            className="border border-[#a65a50] bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#913a32] transition-colors hover:bg-[#913a32] hover:text-[#E8EBEC]"
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