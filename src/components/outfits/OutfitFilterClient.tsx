'use client'

import { useMemo, useState } from 'react'
import OutfitCard from '@/components/products/OutfitCard'
import { Label } from '@/components/ui'
import type { OutfitLook } from '@/lib/products/types'

type OutfitFilterItem = Partial<OutfitLook> & {
  id: string
  title?: string
  description?: string
  heroImage?: string
  gallery?: string[]
  slug?: string
  category?: string
  productLinks?: string[]
  featured?: boolean
  createdAt?: unknown
  updatedAt?: unknown
  sortWeight?: number
  viewCount?: number
  clickCount?: number
  lastViewedAt?: unknown
  lastClickedAt?: unknown
}

type NormalizedOutfit = OutfitLook & {
  category?: string
}

interface OutfitFilterClientProps {
  outfits: OutfitFilterItem[]
}

const categoryOptions = [
  { id: 'all', label: 'All' },
  { id: 'casual-style', label: 'Casual Style' },
  { id: 'formal-wear', label: 'Formal Wear' },
  { id: 'streetwear', label: 'Streetwear' },
  { id: 'date-night', label: 'Date Night' },
  { id: 'weddings-events', label: 'Weddings/Events' },
  { id: 'weekend', label: 'Weekend' },
]

function normalizeFilterValue(value: string): string {
  return value.trim().toLowerCase().replace(/[^\w/]+/g, '-').replace(/\//g, '-')
}

function normalizeOutfit(input: OutfitFilterItem): NormalizedOutfit {
  return {
    id: input.id,
    title: input.title ?? '',
    description: input.description ?? '',
    heroImage: input.heroImage ?? '',
    gallery: Array.isArray(input.gallery) ? input.gallery : [],
    slug: input.slug ?? input.id,
    occasion: '',
    season: '',
    styleType: '',
    productLinks: Array.isArray(input.productLinks) ? input.productLinks : [],
    featured: typeof input.featured === 'boolean' ? input.featured : false,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    sortWeight: input.sortWeight,
    viewCount: input.viewCount,
    clickCount: input.clickCount,
    lastViewedAt: input.lastViewedAt,
    lastClickedAt: input.lastClickedAt,
    category: input.category ?? '',
  }
}

export default function OutfitFilterClient({
  outfits,
}: OutfitFilterClientProps) {
  const [activeCategory, setActiveCategory] = useState('all')

  const normalizedOutfits = useMemo(() => {
    return outfits.map(normalizeOutfit)
  }, [outfits])

  const filteredOutfits = useMemo(() => {
    if (activeCategory === 'all') return normalizedOutfits

    return normalizedOutfits.filter((outfit) => {
      return normalizeFilterValue(outfit.category ?? '') === activeCategory
    })
  }, [activeCategory, normalizedOutfits])

  return (
    <div className="space-y-12">
      <div className="flex justify-center">
        <div className="flex gap-2 flex-wrap justify-center">
          {categoryOptions.map((option) => (
            <Label
              key={option.id}
              variant={activeCategory === option.id ? 'inverse' : 'default'}
              onClick={() => setActiveCategory(option.id)}
              className="cursor-pointer"
            >
              {option.label}
            </Label>
          ))}
        </div>
      </div>

      {filteredOutfits.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-serif text-gray-500">
            No outfits found in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOutfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))}
        </div>
      )}
    </div>
  )
}