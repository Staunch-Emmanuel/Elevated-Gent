'use client'

import { MouseEvent, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button, Label } from '@/components/ui'
import type { OutfitLook, ShoppableLink } from '@/lib/products/types'
import type { OutfitShopItem } from '@/lib/firebase/outfits'
import { useAuth } from '@/lib/firebase/auth'
import { toggleFavorite } from '@/lib/firebase/favorites'

type OutfitCardLook = OutfitLook & {
  category?: string
  shopItems?: OutfitShopItem[]
}

interface OutfitCardProps {
  outfit: OutfitCardLook
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

function getReadableUrl(url: string): string {
  const trimmed = String(url || '').trim()
  if (!trimmed) return ''

  try {
    const parsed = new URL(trimmed)
    const host = parsed.hostname.replace(/^www\./, '')
    const path = parsed.pathname.replace(/\/+$/, '')
    return `${host}${path}` || host
  } catch {
    return trimmed
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
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

export function OutfitCard({ outfit }: OutfitCardProps) {
  const { user } = useAuth()
  const [showLinks, setShowLinks] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  const href = `/outfit-inspiration/${outfit.slug || outfit.id}`

  const shopItems = useMemo(() => {
    return Array.isArray(outfit.shopItems) ? outfit.shopItems : []
  }, [outfit.shopItems])

  const links = useMemo(() => {
    const source = Array.isArray(outfit.productLinks) ? outfit.productLinks : []

    return source
      .map((link, index) => {
        const normalized = normalizeLink(link, index)
        const url = String(normalized.url || '').trim()

        if (!url) return null

        const label =
          normalized.label && normalized.label !== url
            ? normalized.label
            : getFallbackLabel(url, index)

        return {
          label,
          url,
          readableUrl: getReadableUrl(url),
        }
      })
      .filter(
        (
          item
        ): item is {
          label: string
          url: string
          readableUrl: string
        } => Boolean(item)
      )
  }, [outfit.productLinks])

  const handleToggleLinks = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setShowLinks((value) => !value)
  }

  const handleOpenLink = (
    event: MouseEvent<HTMLButtonElement>,
    url: string
  ) => {
    event.preventDefault()
    event.stopPropagation()
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleToggleFavorite = async (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
    event.stopPropagation()

    if (!user?.uid) {
      alert('Please sign in to save favorites.')
      return
    }

    setFavoriteLoading(true)

    try {
      const nextValue = await toggleFavorite({
        userId: user.uid,
        contentId: outfit.id,
        type: 'outfit',
        title: outfit.title,
        imageUrl: outfit.heroImage || '',
        category: outfit.category,
        description: outfit.description,
        href,
        isFavorited,
      })

      setIsFavorited(nextValue)
    } catch (error) {
      console.error('Favorite outfit error:', error)
      alert('Unable to update saved outfit. Please try again.')
    } finally {
      setFavoriteLoading(false)
    }
  }

  return (
    <div className="group flex h-full flex-col overflow-hidden border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] text-[var(--color-eg-ink)] shadow-[0_18px_46px_rgba(24,23,17,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(24,23,17,0.14)]">
      <Link href={href} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-eg-paper-soft)]">
          <Image
            src={outfit.heroImage || '/images/placeholder-outfit.jpg'}
            alt={outfit.title || 'Outfit'}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
          />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,23,17,0.03)_0%,rgba(24,23,17,0.05)_58%,rgba(24,23,17,0.28)_100%)]" />

          {outfit.category ? (
            <div className="absolute left-4 top-4 sm:left-5 sm:top-5">
              <Label className="border-[rgba(248,241,229,0.9)] bg-[rgba(248,241,229,0.94)] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)] shadow-[0_8px_20px_rgba(24,23,17,0.10)] backdrop-blur-sm">
                {outfit.category}
              </Label>
            </div>
          ) : null}

          <div className="absolute right-4 top-4 sm:right-5 sm:top-5">
            <Label
              variant="inverse"
              className="border-[rgba(248,241,229,0.65)] bg-[rgba(24,23,17,0.78)] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-cream)] shadow-[0_8px_20px_rgba(24,23,17,0.14)] backdrop-blur-sm"
            >
              Inspiration
            </Label>
          </div>

          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={favoriteLoading}
            className="absolute bottom-4 right-4 z-10 inline-flex min-h-10 items-center justify-center border border-[rgba(248,241,229,0.78)] bg-[rgba(248,241,229,0.95)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)] shadow-[0_8px_22px_rgba(24,23,17,0.18)] backdrop-blur-sm transition-colors duration-200 hover:border-[var(--color-eg-espresso-deep)] hover:bg-[var(--color-eg-espresso-deep)] hover:text-[var(--color-eg-cream)] disabled:cursor-not-allowed disabled:opacity-60 sm:bottom-5 sm:right-5"
          >
            {isFavorited ? 'Saved' : 'Save'}
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-6 sm:px-6 sm:pb-6 sm:pt-7">
        <div className="flex-1 space-y-3">
          <Link href={href} className="block">
            <h3 className="font-editorial text-[2rem] font-normal leading-[1.02] tracking-[-0.035em] text-[var(--color-eg-ink)] transition-colors duration-200 hover:text-[var(--color-eg-espresso-deep)] sm:text-[2.2rem]">
              {outfit.title}
            </h3>
          </Link>

          {outfit.description ? (
            <p
              className={`whitespace-pre-line font-serif text-[15px] leading-7 text-[var(--color-eg-muted)] ${
                showLinks ? '' : 'line-clamp-3'
              }`}
            >
              {outfit.description}
            </p>
          ) : null}
        </div>

        <div className="mt-6 space-y-3 border-t border-[var(--color-eg-line)] pt-5">
          <Button
            onClick={handleToggleLinks}
            className="min-h-12 w-full border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-cream)] transition-colors duration-200 hover:bg-transparent hover:text-[var(--color-eg-espresso-deep)]"
          >
            {showLinks ? 'Hide Details' : 'Shop the Look'}
          </Button>

          <Link
            href={href}
            className="flex min-h-12 w-full items-center justify-center border border-[var(--color-eg-espresso-deep)] px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)] transition-colors duration-200 hover:bg-[var(--color-eg-espresso-deep)] hover:text-[var(--color-eg-cream)]"
          >
            View Details
          </Link>
        </div>

        {showLinks ? (
          <div className="mt-5 space-y-5 border-t border-[var(--color-eg-line)] pt-5">
            <div className="flex items-center justify-between gap-4">
              <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-eg-espresso-deep)]">
                Shop the Look ({shopItems.length || links.length})
              </h4>
            </div>

            {shopItems.length > 0 ? (
              <div className="space-y-2.5">
                {shopItems.slice(0, 4).map((shopItem, index) => (
                  <div
                    key={shopItem.id || `${outfit.id}-shop-${index}`}
                    className="flex items-center gap-3 border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] p-3 transition-colors duration-200 hover:bg-[var(--color-eg-paper-soft)]"
                  >
                    <div className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden bg-[var(--color-eg-paper-soft)]">
                      {shopItem.imageUrl ? (
                        <Image
                          src={shopItem.imageUrl}
                          alt={shopItem.name || 'Shop item'}
                          fill
                          className="object-cover"
                          sizes="72px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center px-2 text-center text-[9px] uppercase tracking-[0.1em] text-[var(--color-eg-muted)]">
                          Item
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-grow">
                      {shopItem.category ? (
                        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--color-eg-muted)]">
                          {shopItem.category}
                        </p>
                      ) : null}

                      <div className="break-words text-sm font-semibold leading-snug text-[var(--color-eg-ink)]">
                        {shopItem.name || 'Shop Item'}
                      </div>

                      {shopItem.brand ? (
                        <div className="mt-1 break-words font-serif text-xs leading-5 text-[var(--color-eg-muted)]">
                          {shopItem.brand}
                        </div>
                      ) : null}
                    </div>

                    {shopItem.url ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(event) => handleOpenLink(event, shopItem.url)}
                        className="min-h-9 flex-shrink-0 border-[var(--color-eg-espresso-deep)] px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-eg-espresso-deep)] hover:bg-[var(--color-eg-espresso-deep)] hover:text-[var(--color-eg-cream)]"
                      >
                        Open
                      </Button>
                    ) : null}
                  </div>
                ))}

                {shopItems.length > 4 ? (
                  <Link
                    href={href}
                    className="block border border-[var(--color-eg-espresso-deep)] px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)] transition-colors duration-200 hover:bg-[var(--color-eg-espresso-deep)] hover:text-[var(--color-eg-cream)]"
                  >
                    View all items
                  </Link>
                ) : null}
              </div>
            ) : links.length === 0 ? (
              <p className="border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] px-4 py-5 text-center font-serif text-sm text-[var(--color-eg-muted)]">
                No links added yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {links.map((link, index) => (
                  <div
                    key={`${outfit.id}-link-${index}`}
                    className="flex items-center gap-3 border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] p-3 transition-colors duration-200 hover:bg-[var(--color-eg-paper-soft)]"
                  >
                    <div className="min-w-0 flex-grow">
                      <div className="break-words text-sm font-semibold leading-snug text-[var(--color-eg-ink)]">
                        {link.label}
                      </div>

                      <div className="mt-1 break-all font-serif text-xs leading-5 text-[var(--color-eg-muted)]">
                        {link.readableUrl}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(event) => handleOpenLink(event, link.url)}
                      className="min-h-9 flex-shrink-0 border-[var(--color-eg-espresso-deep)] px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-eg-espresso-deep)] hover:bg-[var(--color-eg-espresso-deep)] hover:text-[var(--color-eg-cream)]"
                    >
                      Open
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default OutfitCard