'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import CMSImageUploadField from '@/components/admin/CMSImageUploadField'

import {
  getOutfitById,
  updateOutfit,
  OUTFIT_CATEGORY_OPTIONS,
} from '@/lib/firebase/outfits'
import type { OutfitDocument } from '@/lib/firebase/outfits'

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

function sanitizeLinks(links: string[]): string[] {
  return links.map((link) => link.trim()).filter(Boolean)
}

export default function AdminEditOutfitPage({
  params,
}: AdminEditOutfitPageProps) {
  const router = useRouter()

  const [outfitId, setOutfitId] = useState<string>('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<Partial<OutfitDocument>>({
    galleryImages: [],
    productLinks: [''],
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

  useEffect(() => {
    async function load() {
      if (!outfitId) return

      try {
        const outfit = await getOutfitById(outfitId)

        if (outfit) {
          setForm({
            title: outfit.title,
            description: outfit.description,
            heroImage: outfit.heroImage,
            galleryImages: outfit.galleryImages || [],
            category: outfit.category || '',
            productLinks:
              Array.isArray(outfit.productLinks) && outfit.productLinks.length > 0
                ? outfit.productLinks
                : [''],
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

    load()
  }, [outfitId])

  function updateLink(index: number, value: string) {
    setForm((current) => ({
      ...current,
      productLinks: (current.productLinks || []).map((item, i) =>
        i === index ? value : item
      ),
    }))
  }

  function addLinkField() {
    setForm((current) => ({
      ...current,
      productLinks: [...(current.productLinks || []), ''],
    }))
  }

  function removeLinkField(index: number) {
    setForm((current) => {
      const next = (current.productLinks || []).filter((_, i) => i !== index)
      return {
        ...current,
        productLinks: next.length > 0 ? next : [''],
      }
    })
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

  if (loading) {
    return (
      <ProtectedRoute>
        <PagePadding>
          <Container>
            <p>Loading...</p>
          </Container>
        </PagePadding>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container className="py-12 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-semibold">Edit Outfit</h1>

            <button
              type="button"
              onClick={() => router.push('/admin/outfits')}
              className="text-sm text-gray-500 underline"
            >
              Back to Outfits
            </button>
          </div>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium mb-1">Title</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                URL slug will be:
                <span className="ml-1 font-mono">
                  /outfit-inspiration/{slugify(form.title || '')}
                </span>
              </p>
            </div>

            <div>
              <label className="block font-medium mb-1">Description</label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[120px]"
                rows={4}
                value={form.description || ''}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Category</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={form.category || ''}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select category</option>
                {OUTFIT_CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
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
              <label className="block font-medium mb-2">Product Links</label>

              <div className="space-y-3">
                {(form.productLinks || []).map((link, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => updateLink(index, e.target.value)}
                      className="w-full border rounded-md px-3 py-2 text-sm"
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
            </div>

            <div className="flex items-center gap-6 flex-wrap">
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
              <label className="block font-medium mb-1">Sort Weight</label>
              <input
                type="number"
                className="w-full border rounded-md px-3 py-2 text-sm"
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
              className="px-4 py-2 rounded-md bg-black text-white text-sm disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}