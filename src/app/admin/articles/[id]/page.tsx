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
            <div className="py-12">
              <div className="border border-[#817e6c] bg-[#e8ebec] px-6 py-12 text-center shadow-[0_12px_32px_rgba(36,35,29,0.06)]">
                <p className="font-serif text-[#575348]">Loading...</p>
              </div>
            </div>
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
            <div className="py-12">
              <div className="border border-[#817e6c] bg-[#e8ebec] px-6 py-12 text-center shadow-[0_12px_32px_rgba(36,35,29,0.06)]">
                <p className="font-serif text-[#575348]">Article not found.</p>
              </div>
            </div>
          </Container>
        </PagePadding>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAdmin>
      <PagePadding>
        <Container className="max-w-4xl py-10 md:py-12">
          <div className="mb-8 flex flex-col gap-5 border border-[#817e6c] bg-[#e8ebec] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.07)] sm:p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#625e53]">
                Article Management
              </p>

              <h1 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[#24231d]">
                Edit Article
              </h1>
            </div>

            <button
              type="button"
              onClick={handleDelete}
              className="border border-[#a65a50] bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#913a32] transition-colors hover:bg-[#913a32] hover:text-[#e8ebec]"
            >
              Delete
            </button>
          </div>

          <form
            onSubmit={(e) => void handleSubmit(e, 'published')}
            className="space-y-6 border border-[#817e6c] bg-[#e8ebec] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.06)] sm:p-8"
          >
            {error ? (
              <p className="border border-[#d9aaa4] bg-[#fbefed] px-4 py-3 font-serif text-sm text-[#913a32]">
                {error}
              </p>
            ) : null}

            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817e6c]">
                Title
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="min-h-12 w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
                required
              />

              <p className="mt-2 font-serif text-xs text-[#625e53]">
                URL slug will be:
                <span className="ml-1 font-mono text-[#817e6c]">
                  /articles/{slugify(title)}
                </span>
              </p>
            </div>

            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817e6c]">
                Excerpt
              </label>

              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="min-h-[120px] w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
                rows={3}
              />
            </div>

            <div className="space-y-4 border border-[#817e6c] bg-[#e8ebec] p-5">
              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817e6c]">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="min-h-12 w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm text-[#24231d] outline-none hover:border-[#817e6c] focus:border-[#817e6c]"
                >
                  <option value="">Select category</option>

                  {categories.map((item) => (
                    <option key={item.id} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategoryForm((current) => !current)
                    setCategoryError('')
                  }}
                  className="font-serif text-sm font-semibold text-[#817e6c] underline underline-offset-4 transition-colors hover:text-[#24231d]"
                >
                  {showNewCategoryForm
                    ? 'Cancel new category'
                    : 'Add new category'}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push('/admin/categories?section=articles')
                  }
                  className="font-serif text-sm text-[#625e53] underline underline-offset-4 transition-colors hover:text-[#24231d]"
                >
                  Open full category manager
                </button>
              </div>

              {showNewCategoryForm ? (
                <div className="space-y-4 border border-[#817e6c] bg-[#e8ebec] p-5">
                  <div>
                    <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817e6c]">
                      New category name
                    </label>

                    <input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="min-h-12 w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
                      placeholder="e.g. Fitness"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817e6c]">
                      Description (optional)
                    </label>

                    <textarea
                      value={newCategoryDescription}
                      onChange={(e) =>
                        setNewCategoryDescription(e.target.value)
                      }
                      className="min-h-[100px] w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
                    />
                  </div>

                  {categoryError ? (
                    <p className="border border-[#d9aaa4] bg-[#fbefed] px-4 py-3 font-serif text-sm text-[#913a32]">
                      {categoryError}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => void handleCreateCategory()}
                    disabled={creatingCategory}
                    className="border border-[#817e6c] bg-[#817e6c] px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#e8ebec] transition-colors hover:bg-transparent hover:text-[#817e6c] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {creatingCategory ? 'Creating...' : 'Create Category'}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="border border-[#817e6c] bg-[#e8ebec] p-5">
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
            </div>

            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817e6c]">
                Content (HTML)
              </label>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[420px] w-full border border-[#817e6c] bg-[#24231d] px-4 py-4 font-mono text-sm leading-6 text-[#e8ebec] outline-none placeholder:text-[#817e6c] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
                rows={12}
              />
            </div>

            <div className="flex flex-wrap gap-3 border-t border-[#817e6c] pt-6">
              <button
                type="button"
                disabled={saving}
                onClick={(e) =>
                  void handleSubmit(e as unknown as FormEvent, 'draft')
                }
                className="border border-[#817e6c] bg-transparent px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#817e6c] transition-colors hover:bg-[#817e6c] hover:text-[#e8ebec] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save as Draft'}
              </button>

              <button
                type="submit"
                disabled={saving}
                className="border border-[#817e6c] bg-[#817e6c] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#e8ebec] transition-colors hover:bg-transparent hover:text-[#817e6c] disabled:cursor-not-allowed disabled:opacity-60"
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