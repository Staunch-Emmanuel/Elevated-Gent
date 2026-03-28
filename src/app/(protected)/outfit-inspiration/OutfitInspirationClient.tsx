'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

import { Label } from '@/components/ui'
import { OutfitCard } from '@/components/products/OutfitCard'

import type { OutfitLook } from '@/lib/products/types'
import type { OutfitInspirationDocument } from '@/lib/firebase/outfitInspiration'

type Props = {
  cmsOutfits: OutfitInspirationDocument[]
}

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'casual', label: 'Casual Style' },
  { id: 'formal', label: 'Formal Wear' },
  { id: 'streetwear', label: 'Streetwear' },
  { id: 'date-night', label: 'Date Night' },
  { id: 'weddings-events', label: 'Weddings/Events' },
] as const

function mapCmsOutfitsToLooks(cmsOutfits: OutfitInspirationDocument[]): OutfitLook[] {
  return (cmsOutfits || []).map((doc) => ({
    id: doc.id,
    slug: doc.slug ?? doc.id,
    title: doc.title ?? '',
    description: '',
    heroImage: doc.imageUrl ?? '',
    occasion: doc.occasion ?? 'Weddings/Events',
    season: '',
    styleType: 'Inspiration',
    productLinks: Array.isArray(doc.links) ? doc.links : [],
    featured: Boolean(doc.featured),
  }))
}

function getOutfitsByFilter(outfits: OutfitLook[], filterId: string) {
  if (filterId === 'all') return outfits

  return outfits.filter((outfit) => {
    const occasion = (outfit.occasion || '').toLowerCase()
    const styleType = (outfit.styleType || '').toLowerCase()
    const title = (outfit.title || '').toLowerCase()

    switch (filterId) {
      case 'casual':
        return (
          occasion.includes('casual') ||
          occasion.includes('weekend') ||
          styleType.includes('casual') ||
          title.includes('casual')
        )

      case 'formal':
        return (
          occasion.includes('formal') ||
          occasion.includes('work') ||
          styleType.includes('formal') ||
          styleType.includes('business')
        )

      case 'streetwear':
        return (
          styleType.includes('streetwear') ||
          styleType.includes('modern') ||
          title.includes('streetwear')
        )

      case 'date-night':
        return (
          occasion.includes('date') ||
          occasion.includes('cocktail') ||
          title.includes('date')
        )

      case 'weddings-events':
        return (
          occasion.includes('wedding') ||
          occasion.includes('event') ||
          occasion.includes('formal')
        )

      default:
        return true
    }
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
            <Link key={outfit.id} href={`/outfit-inspiration/${outfit.slug}`} className="block">
              <OutfitCard outfit={outfit} />
            </Link>
          ))}
        </div>
      )}
    </>
  )
}