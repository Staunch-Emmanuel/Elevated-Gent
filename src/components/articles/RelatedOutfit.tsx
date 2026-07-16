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
    <section className="overflow-hidden border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] text-[var(--color-eg-ink)] shadow-[0_16px_40px_rgba(24,23,17,0.09)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-eg-paper-soft)]">
        <Image
          src={outfit.heroImage || '/images/placeholder-outfit.jpg'}
          alt={outfit.title || 'Outfit'}
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,23,17,0.01)_0%,rgba(24,23,17,0.14)_100%)]" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4">
          {outfit.occasion ? (
            <Label className="border-[var(--color-eg-cream)] bg-[var(--color-eg-cream)] text-[var(--color-eg-espresso-deep)]">
              {outfit.occasion}
            </Label>
          ) : null}

          {outfit.styleType ? (
            <Label
              variant="inverse"
              className="border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] text-[var(--color-eg-cream)]"
            >
              {outfit.styleType}
            </Label>
          ) : null}
        </div>
      </div>

      <div className="space-y-5 p-6 md:p-7">
        <div className="space-y-3">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-eg-muted)]">
            {title}
          </p>

          <h3 className="font-editorial text-3xl font-normal leading-tight tracking-[-0.03em] text-[var(--color-eg-ink)]">
            {outfit.title}
          </h3>

          {outfit.description ? (
            <p className="font-serif leading-7 text-[var(--color-eg-muted)]">
              {outfit.description}
            </p>
          ) : null}
        </div>

        <div className="space-y-3 border-t border-[var(--color-eg-line)] pt-5">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-eg-espresso-deep)]">
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
                  className="break-all border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] px-3 py-2 font-serif text-xs text-[var(--color-eg-muted)] underline underline-offset-2 transition-colors hover:border-[var(--color-eg-espresso-deep)] hover:text-[var(--color-eg-espresso-deep)]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : (
            <p className="font-serif text-sm text-[var(--color-eg-muted)]">
              No links added yet.
            </p>
          )}
        </div>

        <div className="border-t border-[var(--color-eg-line)] pt-5">
          <Link href={`/outfit-inspiration/${outfit.slug}`}>
            <Button className="w-full border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] text-[var(--color-eg-cream)] hover:bg-transparent hover:text-[var(--color-eg-espresso-deep)]">
              View Outfit
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default RelatedOutfit