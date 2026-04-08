'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Label, Button } from '@/components/ui'
import type { OutfitLook, ShoppableLink } from '@/lib/products/types'

interface RelatedOutfitProps {
  outfit?: OutfitLook | null
  title?: string
}

function normalizeLink(
  link: string | ShoppableLink,
  index: number
): ShoppableLink {
  if (typeof link === 'string') {
    return {
      label: '',
      url: link,
    }
  }

  return {
    label: typeof link.label === 'string' ? link.label.trim() : '',
    url: link.url,
  }
}

function getFallbackLabel(url: string, index: number): string {
  const trimmed = String(url || '').trim()
  if (!trimmed) return `Link ${index + 1}`

  try {
    const parsed = new URL(trimmed)
    const host = parsed.hostname.replace(/^www\./, '')
    const segments = parsed.pathname.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1] || ''

    if (lastSegment) {
      return `${host} / ${lastSegment.replace(/[-_]+/g, ' ')}`
    }

    return host
  } catch {
    return `Link ${index + 1}`
  }
}

export function RelatedOutfit({
  outfit,
  title = 'Related Outfit',
}: RelatedOutfitProps) {
  if (!outfit) return null

  const links = Array.isArray(outfit.productLinks) ? outfit.productLinks : []

  const normalizedLinks = links
    .map((link, index) => {
      const normalized = normalizeLink(link, index)
      const url = String(normalized.url || '').trim()

      if (!url) return null

      return {
        label:
          normalized.label && normalized.label !== url
            ? normalized.label
            : getFallbackLabel(url, index),
        url,
      }
    })
    .filter(
      (
        link
      ): link is {
        label: string
        url: string
      } => Boolean(link)
    )

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
            {normalizedLinks.length} {normalizedLinks.length === 1 ? 'Link' : 'Links'}
          </p>

          {normalizedLinks.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {normalizedLinks.slice(0, 3).map((link, index) => (
                <a
                  key={`${outfit.id}-link-${index}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs underline break-all"
                >
                  {link.label}
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