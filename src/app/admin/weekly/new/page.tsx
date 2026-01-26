'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import { PRODUCT_CATEGORIES } from '@/lib/products/types'
import { createWeekly, type WeeklyItem } from '@/lib/firebase/weekly'

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const sizes = sizesInput.split(',').map(t => t.trim()).filter(Boolean)
    const colors = colorsInput.split(',').map(t => t.trim()).filter(Boolean)

    // UI-only for now — schema supports single image
    void imagesInput

    const payload: WeeklyItem = {
      id: '', // required by type, replaced by Firestore
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
      tags,
      sizes,
      colors,
    }

    try {
      await createWeekly(payload)
      router.push('/admin/weekly')
    } catch (err) {
      console.error(err)
      alert('Failed to create weekly item.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container className="py-10 max-w-3xl">
          <h1 className="text-2xl font-semibold mb-6">New Weekly Item</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border p-2 rounded w-full"
                required
              />
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

            <div>
              <label className="block text-sm mb-1">Main Image URL</label>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="border p-2 rounded w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Additional Image URLs (not saved yet)
              </label>
              <textarea
                value={imagesInput}
                onChange={(e) => setImagesInput(e.target.value)}
                className="border p-2 rounded w-full min-h-[80px]"
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
