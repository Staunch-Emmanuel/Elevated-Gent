'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import CMSImageUploadField from '@/components/admin/CMSImageUploadField'

import { createOutfit } from '@/lib/firebase/outfits'
import { OUTFIT_OCCASIONS, STYLE_TYPES } from '@/lib/products/types'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sanitizeLinks(links: string[]): string[] {
  return links.map((link) => link.trim()).filter(Boolean)
}

export default function AdminNewOutfitPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [heroImage, setHeroImage] = useState('')
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [occasion, setOccasion] = useState<string>('')
  const [season, setSeason] = useState<string>('All Seasons')
  const [styleType, setStyleType] = useState<string>('')
  const [featured, setFeatured] = useState(false)
  const [sortWeight, setSortWeight] = useState<number>(0)
  const [productLinks, setProductLinks] = useState<string[]>([''])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateLink(index: number, value: string) {
    setProductLinks((current) => current.map((item, i) => (i === index ? value : item)))
  }

  function addLinkField() {
    setProductLinks((current) => [...current, ''])
  }

  function removeLinkField(index: number) {
    setProductLinks((current) => {
      const next = current.filter((_, i) => i !== index)
      return next.length > 0 ? next : ['']
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
        occasion: occasion.trim(),
        season: season.trim(),
        styleType: styleType.trim(),
        productLinks: cleanedLinks,
        featured,
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
    <ProtectedRoute>
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

          {error && (
            <div className="mb-6 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Occasion
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">Select occasion</option>
                  {OUTFIT_OCCASIONS.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Season</label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="All Seasons">All Seasons</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Fall">Fall</option>
                  <option value="Winter">Winter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Style Type
                </label>
                <select
                  value={styleType}
                  onChange={(e) => setStyleType(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">Select style</option>
                  {STYLE_TYPES.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <span>Featured outfit</span>
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

              <div className="space-y-3">
                {productLinks.map((link, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => updateLink(index, e.target.value)}
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
                Add one or more external product URLs for this outfit.
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