'use client'

import { useEffect, useMemo, useState } from 'react'

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

type FilterOption = {
  id: string
  label: string
}

function normalizeFilterValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^\w/]+/g, '-')
    .replace(/\//g, '-')
    .replace(/^-+|-+$/g, '')
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
    category: doc.category ?? '',
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

function buildDynamicFilters(outfits: OutfitInspirationLook[]): FilterOption[] {
  const categoryMap = new Map<string, FilterOption>()

  outfits.forEach((outfit) => {
    const rawCategory = String(outfit.category || '').trim()
    if (!rawCategory) return

    const normalizedId = normalizeFilterValue(rawCategory)
    if (!normalizedId) return

    if (!categoryMap.has(normalizedId)) {
      categoryMap.set(normalizedId, {
        id: normalizedId,
        label: rawCategory,
      })
    }
  })

  return [{ id: 'all', label: 'All' }, ...Array.from(categoryMap.values())]
}

export default function OutfitInspirationClient({ cmsOutfits }: Props) {
  const [activeFilter, setActiveFilter] = useState('all')

  const outfits = useMemo(() => {
    return mapCmsOutfitsToLooks(cmsOutfits || [])
  }, [cmsOutfits])

  const filterOptions = useMemo(() => {
    return buildDynamicFilters(outfits)
  }, [outfits])

  const filteredOutfits = useMemo(() => {
    return getOutfitsByFilter(outfits, activeFilter)
  }, [outfits, activeFilter])

  useEffect(() => {
    if (activeFilter === 'all') return

    const filterStillExists = filterOptions.some(
      (filter) => filter.id === activeFilter
    )

    if (!filterStillExists) {
      setActiveFilter('all')
    }
  }, [activeFilter, filterOptions])

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
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))}
        </div>
      )}
    </>
  )
}