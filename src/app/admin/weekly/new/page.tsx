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
        (item) =>
          item.name.toLowerCase() === newCategoryName.trim().toLowerCase()
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
        <Container className="max-w-4xl py-10 md:py-12">
          <div className="mb-8 flex flex-col gap-5 border border-[#817E6C] bg-[#E8EBEC] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.07)] sm:p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#625e53]">
                Weekly Finds Management
              </p>

              <h1 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[#24231d]">
                New Weekly Item
              </h1>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push('/admin/categories?section=weekly')
              }
              className="border border-[#817E6C] bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#817E6C] transition-colors hover:bg-[#817E6C] hover:text-[#E8EBEC]"
            >
              Manage Categories
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-7 border border-[#817E6C] bg-[#E8EBEC] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.06)] sm:p-8"
          >
            {error ? (
              <p className="border border-[#d9aaa4] bg-[#fbefed] px-4 py-3 font-serif text-sm text-[#913a32]">
                {error}
              </p>
            ) : null}

            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                Title
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                required
              />

              <p className="mt-2 font-serif text-xs text-[#625e53]">
                URL slug will be:
                <span className="ml-1 font-mono text-[#817E6C]">
                  /weekly/{computedSlug}
                </span>
              </p>
            </div>

            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                Brand
              </label>

              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[140px] w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                required
              />
            </div>

            <div className="border border-[#817E6C] bg-[#E8EBEC] p-5">
              <CMSImageUploadField
                label="Main Image"
                folder="weekly"
                documentSlug={slugify(title || brand || 'weekly-item')}
                mode="single"
                value={image}
                onChange={(value) =>
                  setImage(typeof value === 'string' ? value : '')
                }
                helpText="Upload the main weekly product image to Firebase Storage."
                disabled={saving}
              />
            </div>

            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                Additional Image URLs (not saved yet)
              </label>

              <textarea
                value={imagesInput}
                onChange={(e) => setImagesInput(e.target.value)}
                className="min-h-[100px] w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                placeholder="Weekly schema currently supports only one saved image URL."
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                  Price
                </label>

                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                  Original Price
                </label>

                <input
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                />
              </div>
            </div>

            <div className="space-y-4 border border-[#817E6C] bg-[#E8EBEC] p-5">
              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none hover:border-[#817E6C] focus:border-[#817E6C]"
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

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategoryForm((current) => !current)
                    setCategoryError('')
                  }}
                  className="font-serif text-sm font-semibold text-[#817E6C] underline underline-offset-4 transition-colors hover:text-[#24231d]"
                >
                  {showNewCategoryForm
                    ? 'Cancel new category'
                    : 'Add new category'}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push('/admin/categories?section=weekly')
                  }
                  className="font-serif text-sm text-[#625e53] underline underline-offset-4 transition-colors hover:text-[#24231d]"
                >
                  Open full category manager
                </button>
              </div>

              {showNewCategoryForm ? (
                <div className="space-y-4 border border-[#817E6C] bg-[#E8EBEC] p-5">
                  <div>
                    <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                      New category name
                    </label>

                    <input
                      value={newCategoryName}
                      onChange={(e) =>
                        setNewCategoryName(e.target.value)
                      }
                      className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                      placeholder="e.g. Summer Finds"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                      Description (optional)
                    </label>

                    <textarea
                      value={newCategoryDescription}
                      onChange={(e) =>
                        setNewCategoryDescription(e.target.value)
                      }
                      className="min-h-[100px] w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
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
                    className="border border-[#817E6C] bg-[#817E6C] px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#E8EBEC] transition-colors hover:bg-transparent hover:text-[#817E6C] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {creatingCategory ? 'Creating...' : 'Create Category'}
                  </button>
                </div>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                Product Link
              </label>

              <input
                value={productLink}
                onChange={(e) => setProductLink(e.target.value)}
                className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-mono text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                type="url"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                Affiliate Link
              </label>

              <input
                value={affiliateLink}
                onChange={(e) => setAffiliateLink(e.target.value)}
                className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-mono text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                type="url"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                Tags (comma-separated)
              </label>

              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                placeholder="summer, bag, accessory"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                  Sizes (comma-separated)
                </label>

                <input
                  value={sizesInput}
                  onChange={(e) => setSizesInput(e.target.value)}
                  className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                />
              </div>

              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                  Colors (comma-separated)
                </label>

                <input
                  value={colorsInput}
                  onChange={(e) => setColorsInput(e.target.value)}
                  className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 border border-[#817E6C] bg-[#E8EBEC] p-5">
              <label className="inline-flex items-center gap-3 font-serif text-sm text-[#24231d]">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 accent-[#817E6C]"
                />
                <span>Featured</span>
              </label>

              <label className="inline-flex items-center gap-3 font-serif text-sm text-[#24231d]">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="h-4 w-4 accent-[#817E6C]"
                />
                <span>In Stock</span>
              </label>

              <label className="inline-flex items-center gap-3 font-serif text-sm text-[#24231d]">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4 w-4 accent-[#817E6C]"
                />
                <span>Published</span>
              </label>
            </div>

            <div className="border-t border-[#817E6C] pt-6">
              <button
                type="submit"
                disabled={saving}
                className="border border-[#817E6C] bg-[#817E6C] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#E8EBEC] transition-colors hover:bg-transparent hover:text-[#817E6C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Creating…' : 'Create Weekly Item'}
              </button>
            </div>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}