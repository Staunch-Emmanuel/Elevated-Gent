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
        <Container className="max-w-4xl py-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Manage Categories</h1>
              <p className="mt-1 text-sm text-gray-500">{sectionLabel}</p>
            </div>
          </div>

          <div className="mb-8">
            <label className="mb-2 block text-sm font-medium">Section</label>
            <select
              value={section}
              onChange={(e) =>
                handleSectionChange(e.target.value as ContentCategorySection)
              }
              className="min-w-[240px] rounded-md border px-3 py-2 text-sm"
            >
              {SECTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {error ? (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : null}

          <form
            onSubmit={handleCreateCategory}
            className="mb-8 space-y-4 rounded-lg border bg-white p-5"
          >
            <h2 className="text-lg font-semibold">Add Category</h2>

            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="e.g. Summer Finds"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Description (optional)
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add Category'}
            </button>
          </form>

          {loading ? (
            <p>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p>No categories found.</p>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => {
                const isEditing = editingId === category.id

                return (
                  <div
                    key={category.id}
                    className="space-y-3 rounded-lg border bg-white p-4"
                  >
                    {isEditing ? (
                      <>
                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            Name
                          </label>
                          <input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="w-full rounded-md border px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            Description
                          </label>
                          <textarea
                            value={editingDescription}
                            onChange={(e) =>
                              setEditingDescription(e.target.value)
                            }
                            className="min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => void saveEditing(category.id)}
                            disabled={saving}
                            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>

                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={saving}
                            className="rounded border px-4 py-2 text-sm disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="mt-1 text-xs text-gray-500">
                            Slug: {category.slug}
                          </p>
                          {category.description ? (
                            <p className="mt-2 text-sm text-gray-600">
                              {category.description}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => startEditing(category)}
                            disabled={saving}
                            className="text-sm underline disabled:opacity-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleDeleteCategory(category.id)}
                            disabled={saving}
                            className="text-sm text-red-600 underline disabled:opacity-50"
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