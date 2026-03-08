'use client'

import { useEffect, useMemo, useState } from 'react'

import { Label } from '@/components/ui'
import { OutfitCard } from '@/components/products/OutfitCard'

import type { OutfitLook, Product } from '@/lib/products/types'
import type { OutfitDocument } from '@/lib/firebase/admin/outfits'
import { getWeeklyProducts } from '@/lib/firebase/weekly'

type Props = {
  cmsOutfits: OutfitDocument[]
}

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'casual', label: 'Casual Style' },
  { id: 'formal', label: 'Formal Wear' },
  { id: 'streetwear', label: 'Streetwear' },
  { id: 'date-night', label: 'Date Night' },
  { id: 'accessories', label: 'Accessories' },
] as const

const getOutfitsByFilter = (outfits: OutfitLook[], filterId: string) => {
  if (filterId === 'all') return outfits

  const filterMap: Record<string, string[]> = {
    casual: ['Casual', 'Weekend', 'Smart Casual'],
    formal: ['Formal Event', 'Work', 'Business Casual'],
    streetwear: ['Modern', 'Streetwear'],
    'date-night': ['Date Night', 'Cocktail Hour'],
    accessories: [],
  }

  const matchTerms = filterMap[filterId] || []
  return outfits.filter((outfit) =>
    matchTerms.some((term) => outfit.occasion === term || outfit.styleType === term)
  )
}

function normalizeProduct(input: Partial<Product> & { id?: string }): Product {
  return {
    id: input.id ?? '',
    slug: input.slug ?? '',
    title: input.title ?? '',
    brand: input.brand ?? '',
    description: input.description ?? '',
    image: input.image ?? '',
    price: input.price ?? '',
    originalPrice: input.originalPrice ?? '',
    category: input.category ?? '',
    tags: Array.isArray(input.tags) ? input.tags : [],
    productLink: input.productLink ?? '',
    affiliateLink: input.affiliateLink ?? '',
    featured: Boolean(input.featured),
    inStock: typeof input.inStock === 'boolean' ? input.inStock : true,
    sizes: Array.isArray(input.sizes) ? input.sizes : [],
    colors: Array.isArray(input.colors) ? input.colors : [],
  }
}

function buildProductMap(products: Product[]): Map<string, Product> {
  const map = new Map<string, Product>()
  for (const p of products) {
    if (!p?.id) continue
    map.set(p.id, p)
  }
  return map
}

function hydrateCmsOutfits(cmsOutfits: OutfitDocument[], productMap: Map<string, Product>): OutfitLook[] {
  return (cmsOutfits || []).map((doc) => {
    const products: Product[] = (doc.products || [])
      .map((pid) => productMap.get(pid))
      .filter(Boolean) as Product[]

    return {
      id: doc.id,
      slug: doc.slug ?? '',
      title: doc.title ?? '',
      description: doc.description ?? '',
      heroImage: doc.heroImage ?? '',
      occasion: doc.occasion ?? '',
      season: doc.season ?? '',
      styleType: doc.styleType ?? '',
      products,
      totalPrice: typeof doc.totalPrice === 'number' ? doc.totalPrice : 0,
      featured: Boolean(doc.featured),
    }
  })
}

export default function OutfitInspirationClient({ cmsOutfits }: Props) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [outfits, setOutfits] = useState<OutfitLook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const cmsWeekly: Product[] = await getWeeklyProducts()
        const cmsNormalized = cmsWeekly.map((p) => normalizeProduct(p))
        const productMap = buildProductMap(cmsNormalized)
        const hydratedCms = hydrateCmsOutfits(cmsOutfits || [], productMap)

        setOutfits(hydratedCms)
      } catch (err) {
        console.error('Failed to load outfit inspiration:', err)
        setOutfits([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [cmsOutfits])

  const filteredOutfits = useMemo(() => {
    return getOutfitsByFilter(outfits, activeFilter)
  }, [outfits, activeFilter])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 font-serif">Loading outfits…</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-center mb-12">
        <div className="flex gap-2 flex-wrap justify-center">
          {filterOptions.map((filter) => (
            <Label
              key={filter.id}
              variant={activeFilter === filter.id ? 'inverse' : 'default'}
              onClick={() => setActiveFilter(filter.id)}
              className="cursor-pointer"
            >
              {filter.label}
            </Label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredOutfits.map((outfit) => (
          <OutfitCard key={outfit.id} outfit={outfit} />
        ))}
      </div>

      {filteredOutfits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 font-serif">
            No outfits found in this category yet. Check back soon!
          </p>
        </div>
      )}
    </>
  )
}