// src/components/outfits/OutfitFilterClient.tsx
'use client'

import { useMemo, useState } from 'react'
import type { OutfitLook } from '@/lib/products/types'
import OutfitCard from '@/components/products/OutfitCard'
import { Label } from '@/components/ui'

interface OutfitFilterClientProps {
  outfits: Array<Partial<OutfitLook> & { id: string }>
}

const occasionOptions = [
  { id: 'all', label: 'All' },
  { id: 'work', label: 'Work' },
  { id: 'casual', label: 'Casual' },
  { id: 'date-night', label: 'Date Night' },
  { id: 'travel', label: 'Travel' },
  { id: 'weekend', label: 'Weekend' },
  { id: 'formal-event', label: 'Formal Event' },
  { id: 'cocktail-hour', label: 'Cocktail Hour' },
  { id: 'seasonal', label: 'Seasonal' },
]

function normalizeFilterValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-')
}

function normalizeOutfit(input: Partial<OutfitLook> & { id: string }): OutfitLook {
  return {
    id: input.id,
    title: input.title ?? '',
    description: input.description ?? '',
    heroImage: input.heroImage ?? '',
    gallery: Array.isArray(input.gallery) ? input.gallery : [],
    slug: input.slug ?? input.id,
    occasion: input.occasion ?? '',
    season: input.season ?? '',
    styleType: input.styleType ?? '',
    productLinks: Array.isArray(input.productLinks) ? input.productLinks : [],
    featured: typeof input.featured === 'boolean' ? input.featured : false,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    sortWeight: input.sortWeight,
    viewCount: input.viewCount,
    clickCount: input.clickCount,
    lastViewedAt: input.lastViewedAt,
    lastClickedAt: input.lastClickedAt,
  }
}

export default function OutfitFilterClient({
  outfits,
}: OutfitFilterClientProps) {
  const [activeOccasion, setActiveOccasion] = useState('all')

  const normalizedOutfits = useMemo(() => {
    return outfits.map(normalizeOutfit)
  }, [outfits])

  const filteredOutfits = useMemo(() => {
    if (activeOccasion === 'all') return normalizedOutfits

    return normalizedOutfits.filter((outfit) => {
      return normalizeFilterValue(outfit.occasion) === activeOccasion
    })
  }, [activeOccasion, normalizedOutfits])

  return (
    <div className="space-y-12">
      <div className="flex justify-center">
        <div className="flex gap-2 flex-wrap justify-center">
          {occasionOptions.map((option) => (
            <Label
              key={option.id}
              variant={activeOccasion === option.id ? 'inverse' : 'default'}
              onClick={() => setActiveOccasion(option.id)}
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