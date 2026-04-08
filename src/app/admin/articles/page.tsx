'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'

import type { ArticleDocument } from '@/lib/types/articles'
import {
  getAllArticlesCMS,
  deleteArticle,
} from '@/lib/firebase/articles'
import { reslugAllArticles } from '@/lib/firebase/articles.reslug'

type CmsArticle = ArticleDocument & {
  normalizedDate: number
}

function normalizeDate(value: unknown): number {
  try {
    if (!value) return 0

    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? 0 : date.getTime()
    }

    if (typeof (value as { toDate?: () => Date })?.toDate === 'function') {
      const date = (value as { toDate: () => Date }).toDate()
      return Number.isNaN(date.getTime()) ? 0 : date.getTime()
    }

    return 0
  } catch {
    return 0
  }
}

function normalizeCategory(value: unknown): string {
  const normalized = String(value ?? '').trim().toLowerCase()

  if (normalized === 'blueprint') return 'grooming'
  if (normalized === 'confidence') return 'wellness'
  if (normalized === 'products' || normalized === 'occasion') return 'style'
  if (normalized === 'lifetime') return 'lifestyle'

  return normalized || 'general'
}

function getCategoryLabel(value: unknown): string {
  const category = normalizeCategory(value)

  const labels: Record<string, string> = {
    general: 'General',
    wellness: 'Wellness',
    grooming: 'Grooming',
    style: 'Style',
    lifestyle: 'Lifestyle',
  }

  return labels[category] || 'General'
}

export default function AdminArticlesPage() {
  const router = useRouter()

  const [articles, setArticles] = useState<CmsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  async function loadArticles() {
    setLoading(true)

    try {
      const cms = await getAllArticlesCMS()

      const cmsMapped: CmsArticle[] = cms
        .map((item) => ({
          ...item,
          normalizedDate: normalizeDate(
            item.publishDate ?? item.datePublished ?? item.createdAt
          ),
        }))
        .sort((a, b) => b.normalizedDate - a.normalizedDate)

      setArticles(cmsMapped)
    } catch (err) {
      console.error('Failed to load CMS articles:', err)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArticles()
  }, [])

  async function handleReslugAll() {
    if (!confirm('Reslug ALL CMS articles from their titles?')) return

    setBusy(true)
    try {
      const result = await reslugAllArticles()
      alert(
        `Reslug complete.\nUpdated ${result.updated} of ${result.total} articles.`
      )
      await loadArticles()
    } catch (err) {
      console.error(err)
      alert('Reslug failed. Check console.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this article?')) return

    setDeletingId(id)
    try {
      await deleteArticle(id)
      await loadArticles()
    } catch (err) {
      console.error(err)
      alert('Failed to delete article.')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        !search ||
        article.title?.toLowerCase().includes(search.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        filterCategory === 'all' ||
        normalizeCategory(article.category ?? 'general') === filterCategory

      return matchesSearch && matchesCategory
    })
  }, [articles, search, filterCategory])

  return (
    <ProtectedRoute requireAdmin>
      <PagePadding>
        <Container>
          <div className="flex flex-wrap gap-4 justify-between mb-6">
            <h1 className="text-3xl font-bold">Articles (Admin)</h1>

            <div className="flex gap-3">
              <button
                onClick={handleReslugAll}
                disabled={busy}
                className="px-4 py-2 rounded-md border text-sm disabled:opacity-50"
              >
                {busy ? 'Reslugging...' : 'Reslug All Articles'}
              </button>

              <button
                onClick={() => router.push('/admin/articles/new')}
                className="px-4 py-2 rounded-md bg-black text-white text-sm"
              >
                New Article
              </button>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="border rounded-md px-3 py-2 text-sm w-full max-w-xs"
            />

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All categories</option>
              <option value="general">General</option>
              <option value="wellness">Wellness</option>
              <option value="grooming">Grooming</option>
              <option value="style">Style</option>
              <option value="lifestyle">Lifestyle</option>
            </select>
          </div>

          {loading ? <p>Loading...</p> : null}

          {!loading ? (
            <div className="space-y-4">
              {filtered.map((article) => (
                <div
                  key={article.id}
                  className="border rounded-lg px-4 py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{article.title}</p>
                    <p className="text-xs text-gray-500">
                      /articles/{article.slug}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {getCategoryLabel(article.category)}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/articles/${article.slug}`}
                      className="text-sm text-blue-600 underline"
                    >
                      View
                    </Link>

                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="text-sm underline"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(article.id)}
                      disabled={deletingId === article.id}
                      className="text-sm text-red-600 underline disabled:opacity-50"
                    >
                      {deletingId === article.id ? 'Deleting...' : 'Delete'}
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