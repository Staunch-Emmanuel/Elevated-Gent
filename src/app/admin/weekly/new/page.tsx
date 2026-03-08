'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import CMSImageUploadField from '@/components/admin/CMSImageUploadField'
import { PRODUCT_CATEGORIES } from '@/lib/products/types'
import { createWeekly, type WeeklyItem } from '@/lib/firebase/weekly'

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

  const [title, setTitle] = useState('')
  const [brand, setBrand] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [imagesInput, setImagesInput] = useState('')

  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [category, setCategory] = useState('Finds of the Week')

  const [productLink, setProductLink] = useState('')
  const [affiliateLink, setAffiliateLink] = useState('')

  const [featured, setFeatured] = useState(false)
  const [inStock, setInStock] = useState(true)

  const [tagsInput, setTagsInput] = useState('')
  const [sizesInput, setSizesInput] = useState('')
  const [colorsInput, setColorsInput] = useState('')

  const [error, setError] = useState('')

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
      slug: slugify(title),
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
    <ProtectedRoute>
      <PagePadding>
        <Container className="py-10 max-w-3xl">
          <h1 className="text-2xl font-semibold mb-6">New Weekly Item</h1>

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
                <span className="ml-1 font-mono">/weekly/{slugify(title)}</span>
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

            <div>
              <label className="block text-sm mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border p-2 rounded w-full"
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Product Link</label>
              <input
                value={productLink}
                onChange={(e) => setProductLink(e.target.value)}
                className="border p-2 rounded w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Affiliate Link</label>
              <input
                value={affiliateLink}
                onChange={(e) => setAffiliateLink(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Tags (comma-separated)</label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="border p-2 rounded w-full"
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

            <div className="flex items-center gap-6">
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
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-black text-white rounded disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Create Weekly Item'}
            </button>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}