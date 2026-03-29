'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button, Label } from '@/components/ui'
import type { OutfitLook } from '@/lib/products/types'

type OutfitCardLook = OutfitLook & {
  category?: string
}

interface OutfitCardProps {
  outfit: OutfitCardLook
}

export function OutfitCard({ outfit }: OutfitCardProps) {
  const [showLinks, setShowLinks] = useState(false)

  const links = Array.isArray(outfit.productLinks) ? outfit.productLinks : []

  const handleToggleLinks = () => {
    setShowLinks((value) => !value)
  }

  const handleOpenLink = (url: string) => {
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="aspect-[4/5] bg-background-muted relative overflow-hidden">
        <Image
          src={outfit.heroImage || '/images/placeholder-outfit.jpg'}
          alt={outfit.title || 'Outfit'}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
        />

        {outfit.category ? (
          <div className="absolute top-4 left-4">
            <Label className="text-xs">{outfit.category}</Label>
          </div>
        ) : null}

        <div className="absolute top-4 right-4">
          <Label variant="inverse" className="text-xs">
            Inspiration
          </Label>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold font-sans">{outfit.title}</h3>

          {outfit.description ? (
            <p className="font-serif text-gray-600 text-sm">
              {outfit.description}
            </p>
          ) : null}
        </div>

        <Button onClick={handleToggleLinks} className="w-full">
          {showLinks ? 'Hide Links' : 'Shop the Look'}
        </Button>

        {showLinks && (
          <div className="mt-6 space-y-4 border-t border-gray-200 pt-4">
            <h4 className="font-semibold font-sans text-sm uppercase tracking-wide">
              Product Links ({links.length})
            </h4>

            {links.length === 0 ? (
              <p className="text-sm text-gray-500">No links added yet.</p>
            ) : (
              <div className="space-y-3">
                {links.map((link, index) => (
                  <div
                    key={`${outfit.id}-link-${index}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-grow min-w-0">
                      <div className="text-xs font-serif text-gray-500 uppercase tracking-wide">
                        Link {index + 1}
                      </div>
                      <div className="font-semibold text-sm truncate">{link}</div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenLink(link)}
                      className="flex-shrink-0 text-xs"
                    >
                      Open
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default OutfitCard