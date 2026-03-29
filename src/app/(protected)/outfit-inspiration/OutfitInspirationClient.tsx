'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

import { Label } from '@/components/ui'
import { OutfitCard } from '@/components/products/OutfitCard'

import type { OutfitLook } from '@/lib/products/types'
import type { OutfitInspirationDocument } from '@/lib/firebase/outfitInspiration'

type OutfitInspirationLook = OutfitLook & {
  category?: string
}

type Props = {
  cmsOutfits: OutfitInspirationDocument[]
}

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'casual-style', label: 'Casual Style' },
  { id: 'formal-wear', label: 'Formal Wear' },
  { id: 'streetwear', label: 'Streetwear' },
  { id: 'date-night', label: 'Date Night' },
  { id: 'weddings-events', label: 'Weddings/Events' },
  { id: 'weekend', label: 'Weekend' },
] as const

function normalizeFilterValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w/]+/g, '-')
    .replace(/\//g, '-')
}

function mapCmsOutfitsToLooks(
  cmsOutfits: OutfitInspirationDocument[]
): OutfitInspirationLook[] {
  return (cmsOutfits || []).map((doc) => ({
    id: doc.id,
    slug: doc.slug ?? doc.id,
    title: doc.title ?? '',
    description: doc.description ?? '',
    heroImage: doc.imageUrl ?? '',
    occasion: '',
    season: '',
    styleType: '',
    category: doc.category ?? 'Weddings/Events',
    productLinks: Array.isArray(doc.links) ? doc.links : [],
    featured: Boolean(doc.featured),
  }))
}

function getOutfitsByFilter(
  outfits: OutfitInspirationLook[],
  filterId: string
) {
  if (filterId === 'all') return outfits

  return outfits.filter((outfit) => {
    return normalizeFilterValue(outfit.category ?? '') === filterId
  })
}

export default function OutfitInspirationClient({ cmsOutfits }: Props) {
  const [activeFilter, setActiveFilter] = useState('all')

  const outfits = useMemo(() => {
    return mapCmsOutfitsToLooks(cmsOutfits || [])
  }, [cmsOutfits])

  const filteredOutfits = useMemo(() => {
    return getOutfitsByFilter(outfits, activeFilter)
  }, [outfits, activeFilter])

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

      {filteredOutfits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 font-serif">
            No outfits found in this category yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOutfits.map((outfit) => (
            <Link
              key={outfit.id}
              href={`/outfit-inspiration/${outfit.slug}`}
              className="block"
            >
              <OutfitCard outfit={outfit} />
            </Link>
          ))}
        </div>
      )}
    </>
  )
}