'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'

import type { ArticleDocument } from '@/lib/types/articles'
import { getAllArticlesCMS, deleteArticle } from '@/lib/firebase/articles'
import { reslugAllArticles } from '@/lib/firebase/articles.reslug'
import { getContentCategories } from '@/lib/firebase/contentCategories'
import type { ProductCategory } from '@/lib/products/types'

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
  return String(value ?? '').trim().toLowerCase() || 'general'
}

function getCategoryLabel(
  value: unknown,
  categories: ProductCategory[]
): string {
  const normalized = normalizeCategory(value)

  const match = categories.find(
    (item) =>
      item.slug.toLowerCase() === normalized ||
      item.name.toLowerCase() === normalized
  )

  if (match?.name) return match.name
  if (normalized === 'general') return 'General'

  return normalized
}

function ensureGeneralCategory(categories: ProductCategory[]): ProductCategory[] {
  const hasGeneral = categories.some(
    (item) =>
      item.slug?.toLowerCase() === 'general' ||
      item.name?.toLowerCase() === 'general'
  )

  if (hasGeneral) return categories

  return [
    {
      id: 'general',
      name: 'General',
      slug: 'general',
      section: 'articles',
    },
    ...categories,
  ]
}

export default function AdminArticlesPage() {
  const router = useRouter()

  const [articles, setArticles] = useState<CmsArticle[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  async function loadArticles() {
    setLoading(true)

    try {
      const [cms, categoryDocs] = await Promise.all([
        getAllArticlesCMS(),
        getContentCategories('articles'),
      ])

      const cmsMapped: CmsArticle[] = cms
        .map((item) => ({
          ...item,
          normalizedDate: normalizeDate(
            item.publishDate ?? item.datePublished ?? item.createdAt
          ),
        }))
        .sort((a, b) => b.normalizedDate - a.normalizedDate)

      setArticles(cmsMapped)
      setCategories(ensureGeneralCategory(categoryDocs))
    } catch (err) {
      console.error('Failed to load CMS articles:', err)
      setArticles([])
      setCategories(
        ensureGeneralCategory([])
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadArticles()
  }, [])

  async function handleReslugAll() {
    if (!window.confirm('Reslug ALL CMS articles from their titles?')) return

    setBusy(true)
    try {
      const result = await reslugAllArticles()
      window.alert(
        `Reslug complete.\nUpdated ${result.updated} of ${result.total} articles.`
      )
      await loadArticles()
    } catch (err) {
      console.error(err)
      window.alert('Reslug failed. Check console.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this article?')) return

    setDeletingId(id)
    try {
      await deleteArticle(id)
      await loadArticles()
    } catch (err) {
      console.error(err)
      window.alert('Failed to delete article.')
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

      const articleCategory = normalizeCategory(article.category)
      const matchesCategory =
        filterCategory === 'all' ||
        articleCategory === filterCategory.toLowerCase()

      const articleStatus = article.status || 'published'
      const matchesStatus =
        filterStatus === 'all' || articleStatus === filterStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [articles, search, filterCategory, filterStatus])

  return (
    <ProtectedRoute requireAdmin>
      <PagePadding>
        <Container>
          <div className="mb-6 flex flex-wrap justify-between gap-4">
            <h1 className="text-3xl font-bold">Articles (Admin)</h1>

            <div className="flex gap-3">
              <button
                onClick={handleReslugAll}
                disabled={busy}
                className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
              >
                {busy ? 'Reslugging...' : 'Reslug All Articles'}
              </button>

              <button
                onClick={() => router.push('/admin/categories?section=articles')}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Manage Categories
              </button>

              <button
                onClick={() => router.push('/admin/articles/new')}
                className="rounded-md bg-black px-4 py-2 text-sm text-white"
              >
                New Article
              </button>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full max-w-xs rounded-md border px-3 py-2 text-sm"
            />

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-md border px-3 py-2 text-sm"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border px-3 py-2 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {loading ? <p>Loading...</p> : null}

          {!loading ? (
            <div className="space-y-4">
              {filtered.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{article.title}</p>
                    <p className="text-xs text-gray-500">/articles/{article.slug}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>{getCategoryLabel(article.category, categories)}</span>
                      <span>•</span>
                      <span className="capitalize">{article.status || 'published'}</span>
                    </div>
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