import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import { Button, Label } from '@/components/ui'

import { getAllOutfitInspiration } from '@/lib/firebase/outfitInspiration'
import type { OutfitShopItem } from '@/lib/firebase/outfits'
import type { ShoppableLink } from '@/lib/products/types'

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

function normalizeFilterValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^\w/]+/g, '-')
    .replace(/\//g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildShopCategories(items: OutfitShopItem[]) {
  const categoryMap = new Map<string, string>()

  items.forEach((item) => {
    const label = String(item.category || '').trim()
    const id = normalizeFilterValue(label)

    if (!label || !id) return

    categoryMap.set(id, label)
  })

  return [
    { id: 'all', label: 'All' },
    ...Array.from(categoryMap.entries()).map(([id, label]) => ({
      id,
      label,
    })),
  ]
}

export default async function OutfitInspirationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const items = await getAllOutfitInspiration()

  const item =
    items.find(
      (entry) => (entry.slug ?? entry.id) === slug && entry.published !== false
    ) || null

  if (!item) {
    return notFound()
  }

  const legacyLinks = Array.isArray(item.links) ? item.links : []
  const shopItems = Array.isArray(item.shopItems) ? item.shopItems : []
  const shopCategories = buildShopCategories(shopItems)

  const normalizedLinks = legacyLinks
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
        readableUrl: getReadableUrl(url),
      }
    })
    .filter(
      (
        link
      ): link is {
        label: string
        url: string
        readableUrl: string
      } => Boolean(link)
    )

  return (
    <ProtectedRoute>
      <section className="bg-[var(--color-eg-paper)] py-12 text-[var(--color-eg-ink)] md:py-16 lg:py-20">
        <PagePadding>
          <Container className="space-y-12 md:space-y-16">
            <div>
              <Link
                href="/outfit-inspiration"
                className="inline-flex items-center font-sans text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-eg-muted)] transition-colors duration-200 hover:text-[var(--color-eg-espresso-deep)]"
              >
                ← Back to Outfit Inspiration
              </Link>
            </div>

            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
              <div className="border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] p-3 shadow-[0_18px_50px_rgba(36,35,29,0.10)] sm:p-4">
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-eg-paper-soft)]">
                  <Image
                    src={item.imageUrl || '/images/placeholder-outfit.jpg'}
                    alt={item.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              <div className="space-y-7">
                <div className="flex flex-wrap items-center gap-2">
                  {item.category ? (
                    <Label className="border-[var(--color-eg-espresso-deep)] text-[var(--color-eg-espresso-deep)]">
                      {item.category}
                    </Label>
                  ) : null}

                  <Label
                    variant="inverse"
                    className="border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] text-[var(--color-eg-cream)]"
                  >
                    Inspiration
                  </Label>
                </div>

                <h1 className="eg-editorial-heading max-w-3xl text-5xl text-[var(--color-eg-ink)] sm:text-6xl md:text-7xl">
                  {item.title}
                </h1>

                {item.description ? (
                  <p className="w-full max-w-2xl whitespace-pre-line font-serif text-lg leading-8 text-[var(--color-eg-muted)] md:text-xl md:leading-9">
                    {item.description}
                  </p>
                ) : (
                  <p className="w-full max-w-2xl font-serif text-lg leading-8 text-[var(--color-eg-muted)] md:text-xl md:leading-9">
                    Curated outfit inspiration with direct links to shop each selection.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-10 border-t border-[var(--color-eg-line)] pt-12 md:pt-16">
              <div className="mx-auto max-w-2xl text-center">
                <p className="mb-3 font-sans text-[11px] font-medium uppercase tracking-[0.34em] text-[var(--color-eg-muted)]">
                  Curated Pieces
                </p>

                <h2 className="eg-editorial-heading text-4xl text-[var(--color-eg-ink)] md:text-6xl">
                  Shop the Look
                </h2>
              </div>

              {shopItems.length === 0 ? (
                <div className="border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] p-8 text-center md:p-10">
                  <p className="font-serif text-[var(--color-eg-muted)]">
                    No shop items added yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="flex justify-center">
                    <div className="flex flex-wrap justify-center gap-2">
                      {shopCategories.map((category) => (
                        <a
                          key={category.id}
                          href={`#shop-${category.id}`}
                          className="inline-flex border border-[var(--color-eg-espresso-deep)] px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-[var(--color-eg-espresso-deep)] transition-colors duration-200 hover:bg-[var(--color-eg-espresso-deep)] hover:text-[var(--color-eg-cream)]"
                        >
                          {category.label}
                        </a>
                      ))}
                    </div>
                  </div>

                  <div
                    id="shop-all"
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
                  >
                    {shopItems.map((shopItem, index) => (
                      <div
                        key={shopItem.id || `${item.id}-shop-${index}`}
                        id={`shop-${normalizeFilterValue(shopItem.category || 'all')}`}
                        className="flex h-full flex-col border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] p-3 shadow-[0_12px_32px_rgba(36,35,29,0.07)]"
                      >
                        <div className="relative aspect-square overflow-hidden bg-[var(--color-eg-paper-soft)]">
                          {shopItem.imageUrl ? (
                            <Image
                              src={shopItem.imageUrl}
                              alt={shopItem.name || 'Shop item'}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 25vw"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs uppercase tracking-[0.12em] text-[var(--color-eg-muted)]">
                              No Image
                            </div>
                          )}

                          {shopItem.category ? (
                            <div className="absolute left-3 top-3">
                              <Label className="border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-cream)] text-xs text-[var(--color-eg-espresso-deep)]">
                                {shopItem.category}
                              </Label>
                            </div>
                          ) : null}
                        </div>

                        <div className="flex flex-1 flex-col space-y-4 px-1 pb-1 pt-5">
                          <div className="flex-1">
                            {shopItem.brand ? (
                              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-eg-muted)]">
                                {shopItem.brand}
                              </p>
                            ) : null}

                            <h3 className="text-base font-semibold leading-snug text-[var(--color-eg-ink)]">
                              {shopItem.name || 'Shop Item'}
                            </h3>

                            {shopItem.price ? (
                              <p className="mt-2 font-serif text-sm text-[var(--color-eg-muted)]">
                                {shopItem.price}
                              </p>
                            ) : null}
                          </div>

                          {shopItem.url ? (
                            <a href={shopItem.url} target="_blank" rel="noreferrer">
                              <Button
                                className="w-full border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] text-[var(--color-eg-cream)] hover:bg-transparent hover:text-[var(--color-eg-espresso-deep)]"
                                size="sm"
                              >
                                Open
                              </Button>
                            </a>
                          ) : (
                            <Button className="w-full" size="sm" disabled>
                              No Link
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {shopItems.length === 0 && normalizedLinks.length > 0 ? (
              <div className="space-y-7 border-t border-[var(--color-eg-line)] pt-12">
                <h2 className="font-editorial text-3xl font-normal text-[var(--color-eg-ink)] md:text-4xl">
                  Links for this look
                </h2>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {normalizedLinks.map((link, index) => (
                    <div
                      key={`${item.id}-link-${index}`}
                      className="flex flex-col justify-between gap-5 border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] p-6 shadow-[0_10px_28px_rgba(36,35,29,0.06)]"
                    >
                      <div className="space-y-2">
                        <p className="break-words text-base font-semibold text-[var(--color-eg-ink)]">
                          {link.label}
                        </p>

                        <p className="break-all font-serif text-sm leading-6 text-[var(--color-eg-muted)]">
                          {link.readableUrl}
                        </p>
                      </div>

                      <a href={link.url} target="_blank" rel="noreferrer">
                        <Button className="border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] text-[var(--color-eg-cream)] hover:bg-transparent hover:text-[var(--color-eg-espresso-deep)]">
                          Open Link
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </Container>
        </PagePadding>
      </section>
    </ProtectedRoute>
  )
}