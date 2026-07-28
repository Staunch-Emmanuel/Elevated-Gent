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

function ensureGeneralCategory(
  categories: ProductCategory[]
): ProductCategory[] {
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
      setCategories(ensureGeneralCategory([]))
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
        <Container className="max-w-6xl py-10 md:py-12">
          <div className="mb-8 flex flex-col gap-5 border border-[#817e6c] bg-[#e8ebec] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.07)] sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <h1 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[#24231d]">
              Articles (Admin)
            </h1>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleReslugAll}
                disabled={busy}
                className="border border-[#817e6c] bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#817e6c] transition-colors hover:bg-[#817e6c] hover:text-[#e8ebec] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? 'Reslugging...' : 'Reslug All Articles'}
              </button>

              <button
                onClick={() =>
                  router.push('/admin/categories?section=articles')
                }
                className="border border-[#817e6c] bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#817e6c] transition-colors hover:bg-[#817e6c] hover:text-[#e8ebec]"
              >
                Manage Categories
              </button>

              <button
                onClick={() => router.push('/admin/articles/new')}
                className="border border-[#817e6c] bg-[#817e6c] px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#e8ebec] transition-colors hover:bg-transparent hover:text-[#817e6c]"
              >
                New Article
              </button>
            </div>
          </div>

          <div className="mb-8 grid gap-4 border border-[#817e6c] bg-[#e8ebec] p-5 shadow-[0_12px_32px_rgba(36,35,29,0.05)] md:grid-cols-[minmax(0,1fr)_220px_180px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="min-h-12 w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
            />

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="min-h-12 w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm text-[#24231d] outline-none hover:border-[#817e6c] focus:border-[#817e6c]"
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
              className="min-h-12 w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm text-[#24231d] outline-none hover:border-[#817e6c] focus:border-[#817e6c]"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {loading ? (
            <div className="border border-[#817e6c] bg-[#e8ebec] px-6 py-12 text-center shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
              <p className="font-serif text-[#575348]">Loading...</p>
            </div>
          ) : null}

          {!loading ? (
            <div className="space-y-4">
              {filtered.map((article) => (
                <div
                  key={article.id}
                  className="flex flex-col gap-5 border border-[#817e6c] bg-[#e8ebec] px-5 py-5 shadow-[0_10px_28px_rgba(36,35,29,0.05)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-editorial text-xl font-normal leading-tight text-[#24231d]">
                      {article.title}
                    </p>

                    <p className="mt-2 break-all font-mono text-xs text-[#625e53]">
                      /articles/{article.slug}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 font-serif text-xs text-[#575348]">
                      <span>
                        {getCategoryLabel(article.category, categories)}
                      </span>

                      <span>•</span>

                      <span className="capitalize">
                        {article.status || 'published'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 sm:justify-end">
                    <Link
                      href={`/articles/${article.slug}`}
                      className="border border-[#817e6c] bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#817e6c] transition-colors hover:bg-[#817e6c] hover:text-[#e8ebec]"
                    >
                      View
                    </Link>

                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="border border-[#817e6c] bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#817e6c] transition-colors hover:bg-[#817e6c] hover:text-[#e8ebec]"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(article.id)}
                      disabled={deletingId === article.id}
                      className="border border-[#a65a50] bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#913a32] transition-colors hover:bg-[#913a32] hover:text-[#e8ebec] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === article.id
                        ? 'Deleting...'
                        : 'Delete'}
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