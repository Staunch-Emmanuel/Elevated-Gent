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
  { id: 'marks-favorites', label: "Mark's Favorites" },
]

function normalizeFilterValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^\w/]+/g, '-')
    .replace(/\//g, '-')
    .replace(/^-+|-+$/g, '')
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
    <div className="space-y-12 md:space-y-14">
      <div className="flex justify-center">
        <div className="flex max-w-4xl flex-wrap justify-center gap-2.5">
          {categoryOptions.map((option) => (
            <Label
              key={option.id}
              variant={activeCategory === option.id ? 'inverse' : 'default'}
              onClick={() => setActiveCategory(option.id)}
              className={
                activeCategory === option.id
                  ? 'cursor-pointer border-[var(--color-eg-cream)] bg-[var(--color-eg-cream)] px-4 py-2.5 text-[var(--color-eg-espresso-deep)] transition-colors'
                  : 'cursor-pointer border-[rgba(232,235,236,0.52)] px-4 py-2.5 text-[var(--color-eg-cream)] transition-colors hover:border-[var(--color-eg-cream)] hover:bg-[var(--color-eg-cream)] hover:text-[var(--color-eg-espresso-deep)]'
              }
            >
              {option.label}
            </Label>
          ))}
        </div>
      </div>

      {filteredOutfits.length === 0 ? (
        <div className="border border-[var(--color-eg-line-light)] bg-[rgba(232,235,236,0.06)] px-6 py-12 text-center md:py-16">
          <p className="font-serif text-base leading-7 text-[var(--color-text-muted)]">
            No outfits found in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {filteredOutfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))}
        </div>
      )}
    </div>
  )
}