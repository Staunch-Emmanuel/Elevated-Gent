'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import {
  createContentCategory,
  deleteContentCategory,
  getContentCategories,
  updateContentCategory,
  type ContentCategorySection,
} from '@/lib/firebase/contentCategories'
import type { ProductCategory } from '@/lib/products/types'

const SECTION_OPTIONS: Array<{
  value: ContentCategorySection
  label: string
}> = [
  { value: 'weekly', label: 'Weekly Finds' },
  { value: 'outfits', label: 'Outfit Inspiration' },
  { value: 'articles', label: 'Articles' },
]

function isValidSection(value: string | null): value is ContentCategorySection {
  return value === 'weekly' || value === 'outfits' || value === 'articles'
}

function getInitialSection(value: string | null): ContentCategorySection {
  return isValidSection(value) ? value : 'weekly'
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}

export default function AdminCategoriesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [section, setSection] = useState<ContentCategorySection>('weekly')
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingDescription, setEditingDescription] = useState('')

  useEffect(() => {
    setSection(getInitialSection(searchParams.get('section')))
  }, [searchParams])

  async function loadCategories(activeSection: ContentCategorySection) {
    setLoading(true)
    setError('')

    try {
      const docs = await getContentCategories(activeSection)
      setCategories(docs)
    } catch (err) {
      console.error(`Failed to load ${activeSection} categories:`, err)
      setCategories([])
      setError(getErrorMessage(err, 'Failed to load categories.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCategories(section)
  }, [section])

  function handleSectionChange(value: ContentCategorySection) {
    setSection(value)
    setEditingId(null)
    setEditingName('')
    setEditingDescription('')
    setError('')
    router.replace(`/admin/categories?section=${value}`)
  }

  async function handleCreateCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!newName.trim()) return

    setSaving(true)
    setError('')

    try {
      await createContentCategory({
        name: newName.trim(),
        description: newDescription.trim(),
        section,
      })

      setNewName('')
      setNewDescription('')
      await loadCategories(section)
    } catch (err) {
      console.error('Failed to create category:', err)
      setError(getErrorMessage(err, 'Failed to create category.'))
    } finally {
      setSaving(false)
    }
  }

  function startEditing(category: ProductCategory) {
    setEditingId(category.id)
    setEditingName(category.name)
    setEditingDescription(category.description || '')
    setError('')
  }

  function cancelEditing() {
    setEditingId(null)
    setEditingName('')
    setEditingDescription('')
  }

  async function saveEditing(id: string) {
    if (!editingName.trim()) return

    setSaving(true)
    setError('')

    try {
      await updateContentCategory(id, {
        name: editingName.trim(),
        description: editingDescription.trim(),
        section,
      })

      cancelEditing()
      await loadCategories(section)
    } catch (err) {
      console.error('Failed to update category:', err)
      setError(getErrorMessage(err, 'Failed to update category.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!window.confirm('Delete this category?')) return

    setSaving(true)
    setError('')

    try {
      await deleteContentCategory(id)
      await loadCategories(section)
    } catch (err) {
      console.error('Failed to delete category:', err)
      setError(getErrorMessage(err, 'Failed to delete category.'))
    } finally {
      setSaving(false)
    }
  }

  const sectionLabel = useMemo(() => {
    return (
      SECTION_OPTIONS.find((option) => option.value === section)?.label ||
      'Categories'
    )
  }, [section])

  return (
    <ProtectedRoute requireAdmin>
      <PagePadding>
        <Container className="max-w-5xl py-10 md:py-12">
          <div className="mb-8 border border-[#c8bcaa] bg-[#f2eadf] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.07)] sm:p-8">
            <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#625e53]">
              Content Organisation
            </p>

            <h1 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[#24231d]">
              Manage Categories
            </h1>

            <p className="mt-3 font-serif text-sm text-[#575348]">
              {sectionLabel}
            </p>
          </div>

          <div className="mb-8 border border-[#c8bcaa] bg-[#f2eadf] p-5 shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
            <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
              Section
            </label>

            <select
              value={section}
              onChange={(e) =>
                handleSectionChange(e.target.value as ContentCategorySection)
              }
              className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none hover:border-[#77725d] focus:border-[#4f4b3b] sm:min-w-[280px] sm:max-w-sm"
            >
              {SECTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {error ? (
            <div className="mb-6 border border-[#d9aaa4] bg-[#fbefed] px-4 py-3">
              <p className="font-serif text-sm text-[#913a32]">{error}</p>
            </div>
          ) : null}

          <form
            onSubmit={handleCreateCategory}
            className="mb-8 space-y-5 border border-[#c8bcaa] bg-[#f2eadf] p-6 shadow-[0_14px_36px_rgba(36,35,29,0.06)]"
          >
            <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
              Add Category
            </h2>

            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                Name
              </label>

              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                placeholder="e.g. Summer Finds"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                Description (optional)
              </label>

              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="min-h-[110px] w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="border border-[#4f4b3b] bg-[#4f4b3b] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#f8f1e5] transition-colors hover:bg-transparent hover:text-[#4f4b3b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add Category'}
            </button>
          </form>

          {loading ? (
            <div className="border border-[#c8bcaa] bg-[#f2eadf] px-6 py-12 text-center">
              <p className="font-serif text-[#575348]">
                Loading categories...
              </p>
            </div>
          ) : categories.length === 0 ? (
            <div className="border border-[#c8bcaa] bg-[#f2eadf] px-6 py-12 text-center">
              <p className="font-serif text-[#575348]">
                No categories found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => {
                const isEditing = editingId === category.id

                return (
                  <div
                    key={category.id}
                    className="space-y-4 border border-[#c8bcaa] bg-[#f2eadf] p-5 shadow-[0_10px_28px_rgba(36,35,29,0.05)]"
                  >
                    {isEditing ? (
                      <>
                        <div>
                          <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                            Name
                          </label>

                          <input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                            Description
                          </label>

                          <textarea
                            value={editingDescription}
                            onChange={(e) =>
                              setEditingDescription(e.target.value)
                            }
                            className="min-h-[110px] w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                          />
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => void saveEditing(category.id)}
                            disabled={saving}
                            className="border border-[#4f4b3b] bg-[#4f4b3b] px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#f8f1e5] transition-colors hover:bg-transparent hover:text-[#4f4b3b] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>

                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={saving}
                            className="border border-[#77725d] bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b] transition-colors hover:bg-[#4f4b3b] hover:text-[#f8f1e5] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="font-editorial text-2xl font-normal text-[#24231d]">
                            {category.name}
                          </h3>

                          <p className="mt-2 break-all font-mono text-xs text-[#625e53]">
                            Slug: {category.slug}
                          </p>

                          {category.description ? (
                            <p className="mt-3 max-w-2xl font-serif text-sm leading-6 text-[#575348]">
                              {category.description}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => startEditing(category)}
                            disabled={saving}
                            className="border border-[#77725d] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#4f4b3b] transition-colors hover:bg-[#4f4b3b] hover:text-[#f8f1e5] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleDeleteCategory(category.id)
                            }
                            disabled={saving}
                            className="border border-[#a65a50] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#913a32] transition-colors hover:bg-[#913a32] hover:text-[#f8f1e5] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}