'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'

import { weeklyProducts as staticWeeklyProducts } from '@/lib/products/data'
import { getAllWeekly, type WeeklyItem } from '@/lib/firebase/weekly'
import { createOutfit } from '@/lib/firebase/outfits'
import { OUTFIT_OCCASIONS, STYLE_TYPES } from '@/lib/products/types'

/** Local helper: basic slug generator */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Local helper: parse price string like "$129" or "€430" → number */
function parsePrice(price: string): number {
  if (!price) return 0
  const numeric = parseFloat(price.replace(/[^\d.-]/g, ''))
  return isNaN(numeric) ? 0 : numeric
}

interface ProductOption {
  id: string
  title: string
  brand: string
  price: string
  source: 'static' | 'cms'
}

export default function AdminNewOutfitPage() {
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [heroImage, setHeroImage] = useState('')
  const [galleryInput, setGalleryInput] = useState('') // newline-separated URLs
  const [occasion, setOccasion] = useState<string>('')
  const [season, setSeason] = useState<string>('All Seasons')
  const [styleType, setStyleType] = useState<string>('')
  const [featured, setFeatured] = useState(false)
  const [sortWeight, setSortWeight] = useState<number>(0)

  const [products, setProducts] = useState<ProductOption[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])

  const [saving, setSaving] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load static + CMS weekly products for selection
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoadingProducts(true)

        // Static weekly products
        const staticOptions: ProductOption[] = staticWeeklyProducts.map((p) => ({
          id: p.id,
          title: p.title,
          brand: p.brand,
          price: p.price,
          source: 'static',
        }))

        // CMS weekly products
        const cmsDocs: WeeklyItem[] = await getAllWeekly()
        const cmsOptions: ProductOption[] = cmsDocs.map((p) => ({
          id: p.id,
          title: p.title,
          brand: p.brand,
          price: p.price,
          source: 'cms',
        }))

        const merged = [...cmsOptions, ...staticOptions].sort((a, b) =>
          a.title.localeCompare(b.title),
        )

        setProducts(merged)
      } catch (err) {
        console.error('Error loading weekly products:', err)
        setError('Failed to load weekly products.')
      } finally {
        setLoadingProducts(false)
      }
    }

    loadProducts()
  }, [])

  // Compute totalPrice from selected products
  const totalPrice = selectedProductIds.reduce((sum, id) => {
    const product = products.find((p) => p.id === id)
    if (!product) return sum
    return sum + parsePrice(product.price)
  }, 0)

  function handleToggleProduct(id: string) {
    setSelectedProductIds((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id],
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title is required.')
      return
    }

    if (!heroImage.trim()) {
      setError('Hero image URL is required.')
      return
    }

    if (selectedProductIds.length === 0) {
      setError('Select at least one product.')
      return
    }

    setSaving(true)

    try {
      const slug = slugify(title)
      const galleryImages = galleryInput
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

      await createOutfit({
        slug,
        title,
        description,
        heroImage,
        galleryImages,
        occasion,
        season,
        styleType,
        products: selectedProductIds,
        featured,
        totalPrice,
        sortWeight,
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
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="e.g. Smart Casual Weekend Look"
                required
              />
            </div>

            {/* Description */}
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

            {/* Hero Image */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Hero Image URL
              </label>
              <input
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="https://..."
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Main image used for the card and top of the outfit page.
              </p>
            </div>

            {/* Gallery Images */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Gallery Image URLs (optional)
              </label>
              <textarea
                value={galleryInput}
                onChange={(e) => setGalleryInput(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm min-h-[90px]"
                placeholder={'One image URL per line\nhttps://...\nhttps://...'}
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional extra images for the outfit gallery. One URL per
                line.
              </p>
            </div>

            {/* Occasion / Season / StyleType */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Occasion */}
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

              {/* Season */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Season
                </label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="All Seasons">All Seasons</option>
                  <option value="Spring/Summer">Spring/Summer</option>
                  <option value="Fall/Winter">Fall/Winter</option>
                </select>
              </div>

              {/* Style Type */}
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

            {/* Featured + Sort Weight */}
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
                <p className="mt-1 text-[11px] text-gray-500">
                  Higher numbers can push this outfit higher in lists.
                </p>
              </div>
            </div>

            {/* Product selector */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Products in this outfit
              </label>

              {loadingProducts ? (
                <p className="text-sm text-gray-500">
                  Loading products…
                </p>
              ) : products.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No weekly products available yet.
                </p>
              ) : (
                <div className="max-h-80 overflow-y-auto border rounded px-3 py-2 space-y-2 bg-white">
                  {products.map((p) => (
                    <label
                      key={`${p.source}-${p.id}`}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(p.id)}
                          onChange={() => handleToggleProduct(p.id)}
                        />
                        <div>
                          <div className="font-medium">{p.title}</div>
                          <div className="text-xs text-gray-500">
                            {p.brand} • {p.price} • {p.source.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <p className="mt-2 text-xs text-gray-500">
                These products are referenced by ID. Total price is computed
                automatically from their prices.
              </p>
            </div>

            {/* Total price */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Total Price (auto)
              </label>
              <div className="text-lg font-semibold">
                {totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : '$0.00'}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                This value is calculated from the selected product prices and
                saved to Firestore.
              </p>
            </div>

            {/* Submit */}
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
