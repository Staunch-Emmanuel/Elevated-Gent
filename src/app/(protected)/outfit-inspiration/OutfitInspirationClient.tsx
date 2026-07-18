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
    shopItems: Array.isArray(doc.shopItems) ? doc.shopItems : [],
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
      <div className="mb-12 flex justify-center border-b border-[rgba(232,235,236,0.18)] pb-10 md:mb-16 md:pb-12">
        <div className="flex max-w-5xl flex-wrap justify-center gap-3">
          {filterOptions.map((filter) => (
            <Label
              key={filter.id}
              variant={activeFilter === filter.id ? 'inverse' : 'default'}
              onClick={() => setActiveFilter(filter.id)}
              className={
                activeFilter === filter.id
                  ? 'cursor-pointer border-[var(--color-eg-cream)] bg-[var(--color-eg-cream)] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)] shadow-[0_8px_22px_rgba(24,23,17,0.12)] transition-colors duration-200'
                  : 'cursor-pointer border-[rgba(232,235,236,0.58)] bg-transparent px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-cream)] transition-colors duration-200 hover:border-[var(--color-eg-cream)] hover:bg-[var(--color-eg-cream)] hover:text-[var(--color-eg-espresso-deep)]'
              }
            >
              {filter.label}
            </Label>
          ))}
        </div>
      </div>

      {filteredOutfits.length === 0 ? (
        <div className="border border-[rgba(232,235,236,0.3)] bg-[rgba(232,235,236,0.08)] px-6 py-14 text-center shadow-[0_16px_44px_rgba(24,23,17,0.08)] md:py-20">
          <p className="mx-auto max-w-xl font-serif text-base leading-8 text-[rgba(232,235,236,0.88)] md:text-lg">
            No outfits found in this category yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-7 gap-y-10 md:grid-cols-2 lg:gap-x-8 lg:gap-y-12 xl:grid-cols-3">
          {filteredOutfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))}
        </div>
      )}
    </>
  )
}