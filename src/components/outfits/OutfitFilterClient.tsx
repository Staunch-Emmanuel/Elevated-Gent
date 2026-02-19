'use client'

import { useMemo, useState } from 'react'
import { Label } from '@/components/ui'
import OutfitCard from '@/components/products/OutfitCard'
import type { OutfitLook } from '@/lib/products/types'

type FilterMap = Record<string, string[]>

type Props = {
  outfits: Array<Partial<OutfitLook> & { id: string; title: string }>
  filterMap: FilterMap
}

function toOutfitLook(input: Partial<OutfitLook> & { id: string; title: string }): OutfitLook {
  return {
    id: input.id,
    title: input.title,
    description: input.description ?? '',
    heroImage: input.heroImage ?? '/images/placeholder-outfit.jpg',
    occasion: input.occasion ?? '',
    season: input.season ?? '',
    styleType: input.styleType ?? '',
    products: input.products ?? [],
    totalPrice: typeof input.totalPrice === 'number' ? input.totalPrice : 0,
    featured: typeof input.featured === 'boolean' ? input.featured : false,
  }
}

export default function OutfitFilterClient({ outfits, filterMap }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const normalizedOutfits: OutfitLook[] = useMemo(() => {
    return (outfits || []).map(toOutfitLook)
  }, [outfits])

  const filteredOutfits: OutfitLook[] = useMemo(() => {
    if (activeFilter === 'all') return normalizedOutfits

    const matchTerms = filterMap?.[activeFilter] || []
    if (matchTerms.length === 0) return normalizedOutfits

    return normalizedOutfits.filter((outfit) =>
      matchTerms.some(
        (term) => outfit.occasion === term || outfit.styleType === term
      )
    )
  }, [activeFilter, filterMap, normalizedOutfits])

  const filterOptions = useMemo(() => {
    const ids = Object.keys(filterMap || {})
    if (!ids.includes('all')) ids.unshift('all')
    return ids
  }, [filterMap])

  return (
    <div className="space-y-10">
      {/* Filters */}
      <div className="flex justify-center">
        <div className="flex gap-2 flex-wrap justify-center">
          {filterOptions.map((id) => (
            <Label
              key={id}
              variant={activeFilter === id ? 'inverse' : 'default'}
              onClick={() => setActiveFilter(id)}
              className="cursor-pointer"
            >
              {id === 'all' ? 'All' : id.replace(/-/g, ' ')}
            </Label>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredOutfits.map((outfit) => (
          <OutfitCard key={outfit.id} outfit={outfit} />
        ))}
      </div>

      {/* Empty */}
      {filteredOutfits.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm text-gray-500">No outfits found yet.</p>
        </div>
      ) : null}
    </div>
  )
}
