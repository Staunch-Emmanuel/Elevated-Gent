'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import CMSImageUploadField from '@/components/admin/CMSImageUploadField'

import {
  getArticleById,
  updateArticle,
  deleteArticle,
} from '@/lib/firebase/articles'
import {
  createContentCategory,
  getContentCategories,
} from '@/lib/firebase/contentCategories'

import type { ArticleDocument, ArticleStatus } from '@/lib/types/articles'
import type { ProductCategory } from '@/lib/products/types'

interface PageProps {
  params: Promise<{ id: string }>
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminEditArticlePage({ params }: PageProps) {
  const router = useRouter()

  const [articleId, setArticleId] = useState<string>('')
  const [categories, setCategories] = useState<ProductCategory[]>([])

  const [article, setArticle] = useState<ArticleDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('')
  const [heroImage, setHeroImage] = useState('')
  const [content, setContent] = useState('')

  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [categoryError, setCategoryError] = useState('')

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const resolved = await params
        if (!mounted) return
        setArticleId(resolved.id)
      } catch (e) {
        console.error(e)
        if (!mounted) return
        setError('Invalid route params.')
        setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [params])

  async function loadArticleCategories() {
    const categoryDocs = await getContentCategories('articles')
    setCategories(categoryDocs)
    return categoryDocs
  }

  useEffect(() => {
    async function load() {
      if (!articleId) return

      setLoading(true)

      try {
        const [doc, categoryDocs] = await Promise.all([
          getArticleById(articleId),
          loadArticleCategories(),
        ])

        if (!doc) {
          setError('Article not found')
          setLoading(false)
          return
        }

        setArticle(doc)
        setTitle(doc.title ?? '')
        setExcerpt(doc.excerpt ?? '')
        setCategory(doc.category ?? (categoryDocs[0]?.slug || ''))
        setHeroImage(doc.heroImage ?? '')
        setContent(doc.content ?? '')
      } catch (err) {
        console.error(err)
        setError('Failed to load article.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [articleId])

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) {
      setCategoryError('Category name is required.')
      return
    }

    setCreatingCategory(true)
    setCategoryError('')

    try {
      await createContentCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim(),
        section: 'articles',
      })

      const updatedCategories = await loadArticleCategories()
      const created = updatedCategories.find(
        (item) => item.name.toLowerCase() === newCategoryName.trim().toLowerCase()
      )

      if (created) {
        setCategory(created.slug)
      }

      setNewCategoryName('')
      setNewCategoryDescription('')
      setShowNewCategoryForm(false)
    } catch (err) {
      console.error(err)
      setCategoryError(
        err instanceof Error ? err.message : 'Failed to create category.'
      )
    } finally {
      setCreatingCategory(false)
    }
  }

  async function handleSubmit(e: FormEvent, nextStatus: ArticleStatus) {
    e.preventDefault()
    if (!article) return

    setSaving(true)
    setError('')

    const slug = slugify(title)

    if (!slug) {
      setError('Invalid title. Slug could not be generated.')
      setSaving(false)
      return
    }

    try {
      await updateArticle(articleId, {
        title,
        slug,
        excerpt,
        category,
        heroImage,
        content,
        status: nextStatus,
        published: nextStatus === 'published',
      })

      router.push('/admin/articles')
    } catch (err) {
      console.error(err)
      setError('Failed to update article.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this article?')) return
    await deleteArticle(articleId)
    router.push('/admin/articles')
  }

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <PagePadding>
          <Container>
            <p>Loading...</p>
          </Container>
        </PagePadding>
      </ProtectedRoute>
    )
  }

  if (!article) {
    return (
      <ProtectedRoute requireAdmin>
        <PagePadding>
          <Container>
            <p>Article not found.</p>
          </Container>
        </PagePadding>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAdmin>
      <PagePadding>
        <Container className="max-w-2xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Edit Article</h1>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-md border border-red-500 px-3 py-1.5 text-xs text-red-600"
              >
                Delete
              </button>
            </div>
          </div>

          <form onSubmit={(e) => void handleSubmit(e, 'published')} className="space-y-4">
            {error ? (
              <p className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                URL slug will be:
                <span className="ml-1 font-mono">/articles/{slugify(title)}</span>
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategoryForm((current) => !current)
                    setCategoryError('')
                  }}
                  className="text-sm underline"
                >
                  {showNewCategoryForm ? 'Cancel new category' : 'Add new category'}
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/admin/categories?section=articles')}
                  className="text-sm text-gray-600 underline"
                >
                  Open full category manager
                </button>
              </div>

              {showNewCategoryForm ? (
                <div className="space-y-3 rounded-lg border bg-white p-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      New category name
                    </label>
                    <input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="e.g. Fitness"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Description (optional)
                    </label>
                    <textarea
                      value={newCategoryDescription}
                      onChange={(e) => setNewCategoryDescription(e.target.value)}
                      className="min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
                    />
                  </div>

                  {categoryError ? (
                    <p className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600">
                      {categoryError}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => void handleCreateCategory()}
                    disabled={creatingCategory}
                    className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
                  >
                    {creatingCategory ? 'Creating...' : 'Create Category'}
                  </button>
                </div>
              ) : null}
            </div>

            <CMSImageUploadField
              label="Hero Image"
              folder="articles"
              documentSlug={slugify(title)}
              mode="single"
              value={heroImage}
              onChange={(value) =>
                setHeroImage(typeof value === 'string' ? value : '')
              }
              helpText="Replace or remove the current article hero image."
              disabled={saving}
            />

            <div>
              <label className="mb-1 block text-sm font-medium">
                Content (HTML)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                rows={12}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={(e) => void handleSubmit(e as unknown as FormEvent, 'draft')}
                className="rounded-md border px-4 py-2 text-sm disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save as Draft'}
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Publish Article'}
              </button>
            </div>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}