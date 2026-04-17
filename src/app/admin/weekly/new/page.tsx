'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import CMSImageUploadField from '@/components/admin/CMSImageUploadField'
import { createWeekly, type WeeklyItem } from '@/lib/firebase/weekly'
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

export default function NewWeeklyPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<ProductCategory[]>([])

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

  async function loadWeeklyCategories() {
    const docs = await getContentCategories('weekly')
    setCategories(docs)

    if (!category && docs.length > 0) {
      setCategory(docs[0].name)
    }

    return docs
  }

  useEffect(() => {
    async function loadCategories() {
      try {
        await loadWeeklyCategories()
      } catch (err) {
        console.error('Failed to load weekly categories:', err)
      }
    }

    void loadCategories()
  }, [])

  const computedSlug = useMemo(() => slugify(title), [title])

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
    setSaving(true)
    setError('')

    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    const sizes = sizesInput.split(',').map((t) => t.trim()).filter(Boolean)
    const colors = colorsInput.split(',').map((t) => t.trim()).filter(Boolean)

    void imagesInput

    const payload: WeeklyItem = {
      id: '',
      slug: computedSlug,
      title,
      brand,
      description,
      image,
      price,
      originalPrice,
      category,
      tags,
      productLink,
      affiliateLink,
      featured,
      inStock,
      sizes,
      colors,
      published,
    }

    try {
      await createWeekly(payload)
      router.push('/admin/weekly')
    } catch (err) {
      console.error(err)
      setError('Failed to create weekly item.')
      setSaving(false)
    }
  }

  return (
    <ProtectedRoute requireAdmin>
      <PagePadding>
        <Container className="py-10 max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">New Weekly Item</h1>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/admin/categories?section=weekly')}
                className="px-4 py-2 border border-gray-300 rounded text-sm"
              >
                Manage Categories
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error ? (
              <p className="text-sm text-red-600 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            ) : null}

            <div>
              <label className="block text-sm mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border p-2 rounded w-full"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                URL slug will be:
                <span className="ml-1 font-mono">/weekly/{computedSlug}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm mb-1">Brand</label>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="border p-2 rounded w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border p-2 rounded w-full min-h-[120px]"
                required
              />
            </div>

            <CMSImageUploadField
              label="Main Image"
              folder="weekly"
              documentSlug={slugify(title || brand || 'weekly-item')}
              mode="single"
              value={image}
              onChange={(value) => setImage(typeof value === 'string' ? value : '')}
              helpText="Upload the main weekly product image to Firebase Storage."
              disabled={saving}
            />

            <div>
              <label className="block text-sm mb-1">
                Additional Image URLs (not saved yet)
              </label>
              <textarea
                value={imagesInput}
                onChange={(e) => setImagesInput(e.target.value)}
                className="border p-2 rounded w-full min-h-[80px]"
                placeholder="Weekly schema currently supports only one saved image URL."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Price</label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Original Price</label>
                <input
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border p-2 rounded w-full"
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
                      placeholder="e.g. Summer Finds"
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
              <label className="block text-sm mb-1">Product Link</label>
              <input
                value={productLink}
                onChange={(e) => setProductLink(e.target.value)}
                className="border p-2 rounded w-full"
                type="url"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Affiliate Link</label>
              <input
                value={affiliateLink}
                onChange={(e) => setAffiliateLink(e.target.value)}
                className="border p-2 rounded w-full"
                type="url"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Tags (comma-separated)</label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="summer, bag, accessory"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Sizes (comma-separated)</label>
                <input
                  value={sizesInput}
                  onChange={(e) => setSizesInput(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Colors (comma-separated)</label>
                <input
                  value={colorsInput}
                  onChange={(e) => setColorsInput(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <span>Featured</span>
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                />
                <span>In Stock</span>
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
                <span>Published</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-black text-white rounded text-sm disabled:opacity-60"
            >
              {saving ? 'Creating…' : 'Create Weekly Item'}
            </button>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}