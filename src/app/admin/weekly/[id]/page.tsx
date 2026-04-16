'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import CMSImageUploadField from '@/components/admin/CMSImageUploadField'
import { getWeeklyById, updateWeekly, type WeeklyItem } from '@/lib/firebase/weekly'
import {
  createContentCategory,
  getContentCategories,
} from '@/lib/firebase/contentCategories'
import type { ProductCategory } from '@/lib/products/types'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function EditWeeklyPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<ProductCategory[]>([])

  const [item, setItem] = useState<WeeklyItem | null>(null)

  const [title, setTitle] = useState('')
  const [brand, setBrand] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [imagesInput, setImagesInput] = useState('')

  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [category, setCategory] = useState('')

  const [productLink, setProductLink] = useState('')
  const [affiliateLink, setAffiliateLink] = useState('')

  const [featured, setFeatured] = useState(false)
  const [inStock, setInStock] = useState(true)
  const [published, setPublished] = useState(true)

  const [tagsInput, setTagsInput] = useState('')
  const [sizesInput, setSizesInput] = useState('')
  const [colorsInput, setColorsInput] = useState('')

  const [error, setError] = useState('')
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [categoryError, setCategoryError] = useState('')

  const computedSlug = useMemo(() => slugify(title), [title])

  async function loadWeeklyCategories() {
    const categoryDocs = await getContentCategories('weekly')
    setCategories(categoryDocs)
    return categoryDocs
  }

  useEffect(() => {
    async function load() {
      try {
        const [data, categoryDocs] = await Promise.all([
          getWeeklyById(id),
          loadWeeklyCategories(),
        ])

        if (!data) {
          window.alert('Item not found')
          router.push('/admin/weekly')
          return
        }

        setItem(data)

        setTitle(data.title)
        setBrand(data.brand)
        setDescription(data.description)
        setImage(data.image)
        setPrice(data.price)
        setOriginalPrice(data.originalPrice || '')
        setCategory(
          data.category || (categoryDocs.length > 0 ? categoryDocs[0].name : '')
        )
        setProductLink(data.productLink)
        setAffiliateLink(data.affiliateLink || '')
        setFeatured(Boolean(data.featured))
        setInStock(data.inStock ?? true)
        setPublished(data.published !== false)

        setTagsInput((data.tags || []).join(', '))
        setSizesInput((data.sizes || []).join(', '))
        setColorsInput((data.colors || []).join(', '))

        setImagesInput('')
      } catch (err) {
        console.error(err)
        window.alert('Failed to load item.')
        router.push('/admin/weekly')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      void load()
    }
  }, [id, router])

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
        section: 'weekly',
      })

      const updatedCategories = await loadWeeklyCategories()
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!item) return

    setSaving(true)
    setError('')

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const sizes = sizesInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const colors = colorsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    void imagesInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    try {
      await updateWeekly(id, {
        slug: computedSlug,
        title,
        brand,
        description,
        image,
        price,
        originalPrice,
        category,
        productLink,
        affiliateLink,
        featured,
        inStock,
        published,
        tags,
        sizes,
        colors,
      })

      router.push('/admin/weekly')
    } catch (err) {
      console.error(err)
      setError('Failed to save changes.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <PagePadding>
          <Container>
            <p>Loading…</p>
          </Container>
        </PagePadding>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAdmin>
      <PagePadding>
        <Container className="max-w-3xl py-10">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Edit Weekly Item</h1>

            <button
              type="button"
              onClick={() => router.push('/admin/categories?section=weekly')}
              className="rounded border border-gray-300 px-4 py-2 text-sm"
            >
              Manage Categories
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error ? (
              <p className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <div>
              <label className="mb-1 block text-sm">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded border p-2"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                URL slug will be:
                <span className="ml-1 font-mono">/weekly/{computedSlug}</span>
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm">Brand</label>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded border p-2"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] w-full rounded border p-2"
                required
              />
            </div>

            <CMSImageUploadField
              label="Main Image"
              folder="weekly"
              documentSlug={slugify(title || brand || id)}
              mode="single"
              value={image}
              onChange={(value) => setImage(typeof value === 'string' ? value : '')}
              helpText="Replace or remove the saved weekly product image."
              disabled={saving}
            />

            <div>
              <label className="mb-1 block text-sm">
                Additional Image URLs (comma-separated)
              </label>
              <textarea
                value={imagesInput}
                onChange={(e) => setImagesInput(e.target.value)}
                className="min-h-[80px] w-full rounded border p-2"
                placeholder="Not saved yet — WeeklyItem schema currently supports only a single image URL."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm">Price</label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded border p-2"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm">Original Price</label>
                <input
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full rounded border p-2"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded border p-2"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
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
                  onClick={() => router.push('/admin/categories?section=weekly')}
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
                      placeholder="e.g. Spring Finds"
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

            <div>
              <label className="mb-1 block text-sm">Product Link</label>
              <input
                value={productLink}
                onChange={(e) => setProductLink(e.target.value)}
                className="w-full rounded border p-2"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm">Affiliate Link</label>
              <input
                value={affiliateLink}
                onChange={(e) => setAffiliateLink(e.target.value)}
                className="w-full rounded border p-2"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm">Tags (comma-separated)</label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full rounded border p-2"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm">Sizes (comma-separated)</label>
                <input
                  value={sizesInput}
                  onChange={(e) => setSizesInput(e.target.value)}
                  className="w-full rounded border p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm">Colors (comma-separated)</label>
                <input
                  value={colorsInput}
                  onChange={(e) => setColorsInput(e.target.value)}
                  className="w-full rounded border p-2"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                Featured
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                />
                In Stock
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
                Published
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}