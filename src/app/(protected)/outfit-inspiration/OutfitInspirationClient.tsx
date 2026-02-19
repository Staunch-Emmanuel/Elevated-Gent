// src/app/(protected)/outfit-inspiration/OutfitInspirationClient.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'

import { Label } from '@/components/ui'
import { OutfitCard } from '@/components/products/OutfitCard'

import {
  weeklyProducts as staticWeeklyProducts,
  outfitLooks as staticOutfits,
} from '@/lib/products/data'

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

export default function OutfitInspirationClient({ cmsOutfits }: Props) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [outfits, setOutfits] = useState<OutfitLook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // ✅ Client SDK only
        const cmsWeekly: Product[] = await getWeeklyProducts()

        const allWeeklyProducts: Product[] = [...staticWeeklyProducts, ...cmsWeekly]

        const productMap: Record<string, Product> = {}
        for (const p of allWeeklyProducts) productMap[p.id] = p

        const mappedCmsOutfits: OutfitLook[] = (cmsOutfits || []).map((doc) => {
          const products: Product[] = (doc.products || [])
            .map((pid) => productMap[pid])
            .filter(Boolean)

          return {
            id: doc.slug || doc.id,
            title: doc.title,
            description: doc.description,
            heroImage: doc.heroImage,
            occasion: doc.occasion,
            season: doc.season,
            styleType: doc.styleType,
            products,
            totalPrice: doc.totalPrice ?? 0,
            featured: !!doc.featured,
          }
        })

        setOutfits([...staticOutfits, ...mappedCmsOutfits])
      } catch (err) {
        console.error('Failed to load outfit inspiration:', err)
        setOutfits([...staticOutfits])
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
