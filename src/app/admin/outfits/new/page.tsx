'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import CMSImageUploadField from '@/components/admin/CMSImageUploadField'

import {
  createOutfit,
  OUTFIT_CATEGORY_OPTIONS,
} from '@/lib/firebase/outfits'
import type { ShoppableLink } from '@/lib/products/types'

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

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
            <button
              type="button"
              onClick={() => router.push('/admin/outfits')}
              className="text-sm text-gray-500 underline"
            >
              Back to Outfits
            </button>
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

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              >
                <option value="">Select category</option>
                {OUTFIT_CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
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