'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import CMSImageUploadField from '@/components/admin/CMSImageUploadField'

import { getOutfitById, updateOutfit } from '@/lib/firebase/outfits'
import {
  createContentCategory,
  getContentCategories,
} from '@/lib/firebase/contentCategories'
import type { OutfitDocument } from '@/lib/firebase/outfits'
import type { ShoppableLink, ProductCategory } from '@/lib/products/types'

type AdminEditOutfitPageProps = {
  params: Promise<{
    id: string
  }>
}

function slugify(text: string): string {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sanitizeLinks(links: Array<string | ShoppableLink>): ShoppableLink[] {
  return links
    .map((link) => {
      if (typeof link === 'string') {
        const url = link.trim()
        return url ? { label: url, url } : null
      }

      const label = link.label.trim()
      const url = link.url.trim()

      return url ? { label: label || url, url } : null
    })
    .filter((item): item is ShoppableLink => Boolean(item))
}

export default function AdminEditOutfitPage({
  params,
}: AdminEditOutfitPageProps) {
  const router = useRouter()

  const [outfitId, setOutfitId] = useState<string>('')
  const [categories, setCategories] = useState<ProductCategory[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [categoryError, setCategoryError] = useState('')

  const [form, setForm] = useState<Partial<OutfitDocument>>({
    galleryImages: [],
    productLinks: [{ label: '', url: '' }],
    category: '',
    description: '',
  })

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const resolved = await params
        if (!mounted) return
        setOutfitId(resolved.id)
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

  async function loadOutfitCategories() {
    const categoryDocs = await getContentCategories('outfits')
    setCategories(categoryDocs)
    return categoryDocs
  }

  useEffect(() => {
    async function load() {
      if (!outfitId) return

      try {
        const [outfit, categoryDocs] = await Promise.all([
          getOutfitById(outfitId),
          loadOutfitCategories(),
        ])

        if (outfit) {
          const normalizedLinks = sanitizeLinks(outfit.productLinks || [])

          setForm({
            title: outfit.title,
            description: outfit.description,
            heroImage: outfit.heroImage,
            galleryImages: outfit.galleryImages || [],
            category:
              outfit.category || (categoryDocs.length > 0 ? categoryDocs[0].name : ''),
            productLinks:
              normalizedLinks.length > 0
                ? normalizedLinks
                : [{ label: '', url: '' }],
            featured: outfit.featured,
            sortWeight: outfit.sortWeight,
            published: outfit.published,
          })
        } else {
          setError('Outfit not found.')
        }
      } catch (err) {
        console.error(err)
        setError('Failed to load outfit.')
      }

      setLoading(false)
    }

    void load()
  }, [outfitId])

  function updateLink(index: number, field: keyof ShoppableLink, value: string) {
    setForm((current) => {
      const normalized = (current.productLinks || []).map((item) =>
        typeof item === 'string' ? { label: item, url: item } : item
      )

      return {
        ...current,
        productLinks: normalized.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      }
    })
  }

  function addLinkField() {
    setForm((current) => {
      const normalized = (current.productLinks || []).map((item) =>
        typeof item === 'string' ? { label: item, url: item } : item
      )

      return {
        ...current,
        productLinks: [...normalized, { label: '', url: '' }],
      }
    })
  }

  function removeLinkField(index: number) {
    setForm((current) => {
      const normalized = sanitizeLinks(current.productLinks || [])
      const next = normalized.filter((_, i) => i !== index)

      return {
        ...current,
        productLinks: next.length > 0 ? next : [{ label: '', url: '' }],
      }
    })
  }

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
        section: 'outfits',
      })

      const updatedCategories = await loadOutfitCategories()
      const created = updatedCategories.find(
        (item) => item.name.toLowerCase() === newCategoryName.trim().toLowerCase()
      )

      if (created) {
        setForm((current) => ({
          ...current,
          category: created.name,
        }))
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      await updateOutfit(outfitId, {
        title: (form.title || '').trim(),
        description: (form.description || '').trim(),
        heroImage: (form.heroImage || '').trim(),
        galleryImages: (form.galleryImages || []).map((x) => x.trim()),
        category: (form.category || '').trim(),
        productLinks: sanitizeLinks(form.productLinks || []),
        featured: Boolean(form.featured),
        sortWeight: Number(form.sortWeight) || 0,
        published: typeof form.published === 'boolean' ? form.published : true,
      })

      router.push('/admin/outfits')
    } catch (err) {
      console.error(err)
      setError('Failed to update outfit.')
    }

    setSaving(false)
  }

  const editableLinks = (form.productLinks || []).map((item) =>
    typeof item === 'string' ? { label: item, url: item } : item
  )

  const displayedLinks =
    editableLinks.length > 0 ? editableLinks : [{ label: '', url: '' }]

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

  return (
    <ProtectedRoute requireAdmin>
      <PagePadding>
        <Container className="max-w-4xl py-12">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-semibold">Edit Outfit</h1>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/admin/categories?section=outfits')}
                className="rounded border border-gray-300 px-4 py-2 text-sm"
              >
                Manage Categories
              </button>

              <button
                type="button"
                onClick={() => router.push('/admin/outfits')}
                className="text-sm text-gray-500 underline"
              >
                Back to Outfits
              </button>
            </div>
          </div>

          {error ? <p className="mb-4 text-red-600">{error}</p> : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-1 block font-medium">Title</label>
              <input
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">
                URL slug will be:
                <span className="ml-1 font-mono">
                  /outfit-inspiration/{slugify(form.title || '')}
                </span>
              </p>
            </div>

            <div>
              <label className="mb-1 block font-medium">Description</label>
              <textarea
                className="min-h-[120px] w-full rounded-md border px-3 py-2 text-sm"
                rows={4}
                value={form.description || ''}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block font-medium">Category</label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.category || ''}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
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
                  onClick={() => router.push('/admin/categories?section=outfits')}
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
                      placeholder="e.g. Vacation"
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
              folder="outfits"
              documentSlug={slugify(form.title || '')}
              mode="single"
              value={form.heroImage || ''}
              onChange={(value) =>
                setForm({
                  ...form,
                  heroImage: typeof value === 'string' ? value : '',
                })
              }
              helpText="Replace or remove the main outfit image."
              disabled={saving}
            />

            <CMSImageUploadField
              label="Gallery Images"
              folder="outfits"
              documentSlug={slugify(form.title || '')}
              mode="multiple"
              value={Array.isArray(form.galleryImages) ? form.galleryImages : []}
              onChange={(value) =>
                setForm({
                  ...form,
                  galleryImages: Array.isArray(value) ? value : [],
                })
              }
              helpText="Optional extra outfit gallery images."
              disabled={saving}
            />

            <div>
              <label className="mb-2 block font-medium">Product Links</label>

              <div className="space-y-4">
                {displayedLinks.map((link, index) => (
                  <div key={index} className="space-y-3 rounded-lg border p-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Link Name
                      </label>
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateLink(index, 'label', e.target.value)}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="e.g. Blazer, Shoes, Watch"
                      />
                    </div>

                    <div className="flex gap-3">
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="https://example.com/product"
                      />

                      <button
                        type="button"
                        onClick={() => removeLinkField(index)}
                        className="rounded border px-3 py-2 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addLinkField}
                className="mt-3 text-sm underline"
              >
                + Add another link
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured || false}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                />
                <span>Featured outfit</span>
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.published !== false}
                  onChange={(e) =>
                    setForm({ ...form, published: e.target.checked })
                  }
                />
                <span>Published</span>
              </label>
            </div>

            <div>
              <label className="mb-1 block font-medium">Sort Weight</label>
              <input
                type="number"
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={form.sortWeight || 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sortWeight: Number(e.target.value),
                  })
                }
              />
            </div>

            <button
              disabled={saving}
              className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}