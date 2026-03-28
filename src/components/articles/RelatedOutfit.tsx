'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Label, Button } from '@/components/ui'
import type { OutfitLook } from '@/lib/products/types'

interface RelatedOutfitProps {
  outfit?: OutfitLook | null
  title?: string
}

export function RelatedOutfit({
  outfit,
  title = 'Related Outfit',
}: RelatedOutfitProps) {
  if (!outfit) return null

  const links = Array.isArray(outfit.productLinks) ? outfit.productLinks : []

  return (
    <section className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="aspect-[4/5] bg-background-muted relative overflow-hidden">
        <Image
          src={outfit.heroImage || '/images/placeholder-outfit.jpg'}
          alt={outfit.title || 'Outfit'}
          fill
          className="object-cover"
        />

        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {outfit.occasion ? <Label>{outfit.occasion}</Label> : null}
          {outfit.styleType ? <Label variant="inverse">{outfit.styleType}</Label> : null}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-sans">
            {title}
          </p>

          <h3 className="text-2xl font-semibold font-sans">
            {outfit.title}
          </h3>

          {outfit.description ? (
            <p className="font-serif text-muted">
              {outfit.description}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-sans font-semibold">
            {links.length} {links.length === 1 ? 'Link' : 'Links'}
          </p>

          {links.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {links.slice(0, 3).map((link, index) => (
                <a
                  key={`${outfit.id}-link-${index}`}
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs underline break-all"
                >
                  Link {index + 1}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm font-serif text-gray-500">
              No links added yet.
            </p>
          )}
        </div>

        <div className="pt-2">
          <Link href={`/outfit-inspiration/${outfit.slug}`}>
            <Button className="w-full">View Outfit</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default RelatedOutfit