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
              outfit.category ||
              (categoryDocs.length > 0 ? categoryDocs[0].name : ''),
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
        (item) =>
          item.name.toLowerCase() === newCategoryName.trim().toLowerCase()
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
        published:
          typeof form.published === 'boolean' ? form.published : true,
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
            <div className="py-12">
              <div className="border border-[#c8bcaa] bg-[#f2eadf] px-6 py-12 text-center shadow-[0_12px_32px_rgba(36,35,29,0.06)]">
                <p className="font-serif text-[#575348]">Loading...</p>
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
          <div className="mb-8 flex flex-col gap-5 border border-[#c8bcaa] bg-[#f2eadf] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.07)] sm:p-8 md:flex-row md:items-center md:justify-between">
            <h1 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[#24231d]">
              Edit Outfit
            </h1>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  router.push('/admin/categories?section=outfits')
                }
                className="border border-[#77725d] bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#4f4b3b] transition-colors hover:bg-[#4f4b3b] hover:text-[#f8f1e5]"
              >
                Manage Categories
              </button>

              <button
                type="button"
                onClick={() => router.push('/admin/outfits')}
                className="border border-[#b9ae9d] bg-[#e9dfd1] px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#4f4b3b] transition-colors hover:border-[#4f4b3b] hover:bg-[#4f4b3b] hover:text-[#f8f1e5]"
              >
                Back to Outfits
              </button>
            </div>
          </div>

          {error ? (
            <p className="mb-6 border border-[#d9aaa4] bg-[#fbefed] px-4 py-3 font-serif text-sm text-[#913a32]">
              {error}
            </p>
          ) : null}

          <form
            onSubmit={handleSubmit}
            className="space-y-7 border border-[#c8bcaa] bg-[#f2eadf] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.06)] sm:p-8"
          >
            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                Title
              </label>

              <input
                className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <p className="mt-2 font-serif text-xs text-[#625e53]">
                URL slug will be:
                <span className="ml-1 font-mono text-[#4f4b3b]">
                  /outfit-inspiration/{slugify(form.title || '')}
                </span>
              </p>
            </div>

            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                Description
              </label>

              <textarea
                className="min-h-[140px] w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                rows={4}
                value={form.description || ''}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-4 border border-[#d2c6b5] bg-[#e9dfd1] p-5">
              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                  Category
                </label>

                <select
                  className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none hover:border-[#77725d] focus:border-[#4f4b3b]"
                  value={form.category || ''}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  <option value="">Select category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
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
                  className="font-serif text-sm font-semibold text-[#4f4b3b] underline underline-offset-4 transition-colors hover:text-[#24231d]"
                >
                  {showNewCategoryForm
                    ? 'Cancel new category'
                    : 'Add new category'}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push('/admin/categories?section=outfits')
                  }
                  className="font-serif text-sm text-[#625e53] underline underline-offset-4 transition-colors hover:text-[#24231d]"
                >
                  Open full category manager
                </button>
              </div>

              {showNewCategoryForm ? (
                <div className="space-y-4 border border-[#c8bcaa] bg-[#f8f1e5] p-5">
                  <div>
                    <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                      New category name
                    </label>

                    <input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="min-h-12 w-full border border-[#b9ae9d] bg-[#f2eadf] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                      placeholder="e.g. Vacation"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                      Description (optional)
                    </label>

                    <textarea
                      value={newCategoryDescription}
                      onChange={(e) =>
                        setNewCategoryDescription(e.target.value)
                      }
                      className="min-h-[100px] w-full border border-[#b9ae9d] bg-[#f2eadf] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
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
                    className="border border-[#4f4b3b] bg-[#4f4b3b] px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#f8f1e5] transition-colors hover:bg-transparent hover:text-[#4f4b3b] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {creatingCategory ? 'Creating...' : 'Create Category'}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="border border-[#d2c6b5] bg-[#e9dfd1] p-5">
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
            </div>

            <div className="border border-[#d2c6b5] bg-[#e9dfd1] p-5">
              <CMSImageUploadField
                label="Gallery Images"
                folder="outfits"
                documentSlug={slugify(form.title || '')}
                mode="multiple"
                value={
                  Array.isArray(form.galleryImages) ? form.galleryImages : []
                }
                onChange={(value) =>
                  setForm({
                    ...form,
                    galleryImages: Array.isArray(value) ? value : [],
                  })
                }
                helpText="Optional extra outfit gallery images."
                disabled={saving}
              />
            </div>

            <div>
              <label className="mb-3 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                Product Links
              </label>

              <div className="space-y-4">
                {displayedLinks.map((link, index) => (
                  <div
                    key={index}
                    className="space-y-4 border border-[#c8bcaa] bg-[#e9dfd1] p-5"
                  >
                    <div>
                      <label className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4f4b3b]">
                        Link Name
                      </label>

                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) =>
                          updateLink(index, 'label', e.target.value)
                        }
                        className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                        placeholder="e.g. Blazer, Shoes, Watch"
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) =>
                          updateLink(index, 'url', e.target.value)
                        }
                        className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                        placeholder="https://example.com/product"
                      />

                      <button
                        type="button"
                        onClick={() => removeLinkField(index)}
                        className="border border-[#a65a50] bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#913a32] transition-colors hover:bg-[#913a32] hover:text-[#f8f1e5]"
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
                className="mt-4 font-serif text-sm font-semibold text-[#4f4b3b] underline underline-offset-4 transition-colors hover:text-[#24231d]"
              >
                + Add another link
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6 border border-[#d2c6b5] bg-[#e9dfd1] p-5">
              <label className="inline-flex items-center gap-3 font-serif text-sm text-[#24231d]">
                <input
                  type="checkbox"
                  checked={form.featured || false}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                  className="h-4 w-4 accent-[#4f4b3b]"
                />
                <span>Featured outfit</span>
              </label>

              <label className="inline-flex items-center gap-3 font-serif text-sm text-[#24231d]">
                <input
                  type="checkbox"
                  checked={form.published !== false}
                  onChange={(e) =>
                    setForm({ ...form, published: e.target.checked })
                  }
                  className="h-4 w-4 accent-[#4f4b3b]"
                />
                <span>Published</span>
              </label>
            </div>

            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                Sort Weight
              </label>

              <input
                type="number"
                className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none hover:border-[#77725d] focus:border-[#4f4b3b]"
                value={form.sortWeight || 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sortWeight: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="border-t border-[#c8bcaa] pt-6">
              <button
                disabled={saving}
                className="border border-[#4f4b3b] bg-[#4f4b3b] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#f8f1e5] transition-colors hover:bg-transparent hover:text-[#4f4b3b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}