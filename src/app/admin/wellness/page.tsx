'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'

import type { WellnessItem } from '@/lib/firebase/wellness'
import {
  getWellnessItems,
  deleteWellness,
} from '@/lib/firebase/wellness'

export default function AdminWellnessPage() {
  const router = useRouter()

  const [articles, setArticles] = useState<WellnessItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError('')

      try {
        const data = await getWellnessItems()

        if (!mounted) return
        setArticles(data || [])
      } catch (err: any) {
        console.error('Failed to load wellness items:', err)

        if (!mounted) return

        setError(
          err?.message ||
            'Failed to load wellness items (missing permissions or network error).'
        )
        setArticles([])
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this wellness article?')) return

    try {
      await deleteWellness(id)
      setArticles((previous) =>
        previous.filter((article) => article.id !== id)
      )
    } catch (err: any) {
      console.error('Failed to delete wellness item:', err)
      alert(err?.message || 'Failed to delete wellness article.')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="border border-[#c8bcaa] bg-[#f2eadf] px-6 py-12 text-center shadow-[0_12px_32px_rgba(36,35,29,0.06)]">
          <p className="font-serif text-[#575348]">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container className="py-10 md:py-12">
          <div className="mb-8 flex flex-col gap-5 border border-[#c8bcaa] bg-[#f2eadf] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.07)] sm:p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#625e53]">
                Editorial Management
              </p>

              <h1 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[#24231d]">
                Wellness
              </h1>
            </div>

            <Link
              href="/admin/wellness/new"
              className="border border-[#4f4b3b] bg-[#4f4b3b] px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#f8f1e5] transition-colors hover:bg-transparent hover:text-[#4f4b3b]"
            >
              + New Article
            </Link>
          </div>

          {error ? (
            <div className="mb-6 border border-[#d9aaa4] bg-[#fbefed] p-5">
              <p className="font-serif text-sm font-semibold text-[#913a32]">
                Wellness failed to load
              </p>

              <p className="mt-2 font-serif text-sm text-[#913a32]">
                {error}
              </p>

              <p className="mt-3 font-serif text-xs leading-5 text-[#913a32]">
                If this says “Missing or insufficient permissions”, your
                Firestore rules are blocking this user/environment.
              </p>
            </div>
          ) : null}

          {!error && articles.length === 0 ? (
            <div className="border border-[#c8bcaa] bg-[#f2eadf] px-6 py-12 text-center shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
              <p className="font-serif text-[#575348]">
                No wellness articles yet.
              </p>
            </div>
          ) : !error ? (
            <div className="space-y-4">
              {articles.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-5 border border-[#c8bcaa] bg-[#f2eadf] p-5 shadow-[0_10px_28px_rgba(36,35,29,0.05)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="font-editorial text-2xl font-normal leading-tight text-[#24231d]">
                      {item.title}
                    </h3>

                    {item.slug ? (
                      <p className="mt-2 break-all font-mono text-xs text-[#625e53]">
                        {item.slug}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-3 sm:justify-end">
                    <button
                      onClick={() =>
                        router.push(`/admin/wellness/${item.id}`)
                      }
                      className="border border-[#77725d] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#4f4b3b] transition-colors hover:bg-[#4f4b3b] hover:text-[#f8f1e5]"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="border border-[#a65a50] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#913a32] transition-colors hover:bg-[#913a32] hover:text-[#f8f1e5]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}