'use client'

import { MouseEvent, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button, Label } from '@/components/ui'
import type { OutfitLook, ShoppableLink } from '@/lib/products/types'
import { useAuth } from '@/lib/firebase/auth'
import { toggleFavorite } from '@/lib/firebase/favorites'

type OutfitCardLook = OutfitLook & {
  category?: string
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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden h-full">
      <Link href={href} className="block">
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

          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={favoriteLoading}
            className="absolute bottom-4 right-4 z-10 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-black shadow-sm hover:bg-black hover:text-white transition-colors disabled:opacity-60"
          >
            {isFavorited ? 'Saved' : 'Save'}
          </button>
        </div>
      </Link>

      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <Link href={href} className="block">
            <h3 className="text-xl font-semibold font-sans hover:underline">
              {outfit.title}
            </h3>
          </Link>

          {outfit.description ? (
            <p
              className={`font-serif text-gray-600 text-sm whitespace-pre-line ${
                showLinks ? '' : 'line-clamp-2'
              }`}
            >
              {outfit.description}
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <Button onClick={handleToggleLinks} className="w-full">
            {showLinks ? 'Hide Details' : 'Shop the Look'}
          </Button>

          <Link
            href={href}
            className="block w-full border border-black px-4 py-3 text-center text-sm font-medium uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
          >
            View Details
          </Link>
        </div>

        {showLinks ? (
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
                      <div className="text-sm font-semibold text-gray-900 break-words">
                        {link.label}
                      </div>
                      <div className="text-xs text-gray-500 break-all mt-1">
                        {link.readableUrl}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(event) => handleOpenLink(event, link.url)}
                      className="flex-shrink-0 text-xs"
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