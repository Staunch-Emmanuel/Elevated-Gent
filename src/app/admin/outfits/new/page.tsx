'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import CMSImageUploadField from '@/components/admin/CMSImageUploadField'

import { createOutfit } from '@/lib/firebase/outfits'
import {
  createContentCategory,
  getContentCategories,
} from '@/lib/firebase/contentCategories'
import type { ShoppableLink, ProductCategory } from '@/lib/products/types'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sanitizeLinks(links: ShoppableLink[]): ShoppableLink[] {
  return links
    .map((link) => ({
      label: link.label.trim(),
      url: link.url.trim(),
    }))
    .filter((link) => Boolean(link.url))
}

export default function AdminNewOutfitPage() {
  const router = useRouter()

  const [categories, setCategories] = useState<ProductCategory[]>([])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [heroImage, setHeroImage] = useState('')
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [category, setCategory] = useState<string>('')
  const [featured, setFeatured] = useState(false)
  const [published, setPublished] = useState(true)
  const [sortWeight, setSortWeight] = useState<number>(0)
  const [productLinks, setProductLinks] = useState<ShoppableLink[]>([
    { label: '', url: '' },
  ])

  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [categoryError, setCategoryError] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadOutfitCategories() {
    const docs = await getContentCategories('outfits')
    setCategories(docs)

    if (!category && docs.length > 0) {
      setCategory(docs[0].name)
    }

    return docs
  }

  useEffect(() => {
    async function loadCategories() {
      try {
        await loadOutfitCategories()
      } catch (err) {
        console.error('Failed to load outfit categories:', err)
      }
    }

    void loadCategories()
  }, [])

  function updateLink(index: number, field: keyof ShoppableLink, value: string) {
    setProductLinks((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  function addLinkField() {
    setProductLinks((current) => [...current, { label: '', url: '' }])
  }

  function removeLinkField(index: number) {
    setProductLinks((current) => {
      const next = current.filter((_, i) => i !== index)
      return next.length > 0 ? next : [{ label: '', url: '' }]
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
        setCategory(created.name)
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
    setError(null)

    const cleanedLinks = sanitizeLinks(productLinks)

    if (!title.trim()) {
      setError('Title is required.')
      return
    }

    if (!description.trim()) {
      setError('Description is required.')
      return
    }

    if (!category.trim()) {
      setError('Category is required.')
      return
    }

    if (!heroImage.trim()) {
      setError('Hero image is required.')
      return
    }

    if (cleanedLinks.length === 0) {
      setError('Add at least one product link.')
      return
    }

    setSaving(true)

    try {
      await createOutfit({
        slug: slugify(title),
        title: title.trim(),
        description: description.trim(),
        heroImage: heroImage.trim(),
        galleryImages,
        category: category.trim(),
        productLinks: cleanedLinks,
        featured,
        published,
        sortWeight: Number(sortWeight) || 0,
      })

      router.push('/admin/outfits')
    } catch (err) {
      console.error('Error creating outfit:', err)
      setError('Failed to create outfit. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProtectedRoute requireAdmin>
      <PagePadding>
        <Container className="py-10 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold">New Outfit Look</h1>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/admin/categories?section=outfits')}
                className="text-sm border border-gray-300 px-4 py-2 rounded"
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

          {error ? (
            <div className="mb-6 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="e.g. Smart Casual Weekend Look"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm min-h-[120px]"
                placeholder="Short description of the outfit, where to wear it, what it communicates..."
                required
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((option) => (
                    <option key={option.id} value={option.name}>
                      {option.name}
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
              documentSlug={slugify(title)}
              mode="single"
              value={heroImage}
              onChange={(value) => setHeroImage(typeof value === 'string' ? value : '')}
              helpText="Main image used for the card and top of the outfit page."
              disabled={saving}
            />

            <CMSImageUploadField
              label="Gallery Images"
              folder="outfits"
              documentSlug={slugify(title)}
              mode="multiple"
              value={galleryImages}
              onChange={(value) => setGalleryImages(Array.isArray(value) ? value : [])}
              helpText="Optional extra images for the outfit gallery."
              disabled={saving}
            />

            <div className="flex items-center gap-6 flex-wrap">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <span>Featured outfit</span>
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
                <span>Published</span>
              </label>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Sort Weight (optional)
                </label>
                <input
                  type="number"
                  value={sortWeight}
                  onChange={(e) => setSortWeight(Number(e.target.value || 0))}
                  className="w-32 border rounded px-2 py-1 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Product Links
              </label>

              <div className="space-y-4">
                {productLinks.map((link, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Link Name
                      </label>
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateLink(index, 'label', e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="e.g. Blazer, Shoes, Watch"
                      />
                    </div>

                    <div className="flex gap-3">
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="https://example.com/product"
                      />

                      <button
                        type="button"
                        onClick={() => removeLinkField(index)}
                        className="px-3 py-2 border rounded text-sm"
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

              <p className="mt-2 text-xs text-gray-500">
                Add one or more external product URLs and optional custom names for each one.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 rounded bg-black text-white text-sm disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Create Outfit'}
              </button>
            </div>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}