import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import { Button, Label } from '@/components/ui'

import OutfitShopGrid from './OutfitShopGrid'

import { getAllOutfitInspiration } from '@/lib/firebase/outfitInspiration'
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

export default async function OutfitInspirationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const items = await getAllOutfitInspiration()

  const item =
    items.find(
      (entry) =>
        (entry.slug ?? entry.id) === slug &&
        entry.published !== false
    ) || null

  if (!item) {
    return notFound()
  }

  const legacyLinks = Array.isArray(item.links) ? item.links : []
  const shopItems = Array.isArray(item.shopItems) ? item.shopItems : []

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
      <section className="bg-[var(--color-eg-paper)] py-8 text-[var(--color-eg-ink)] sm:py-10 md:py-14 lg:py-20">
        <PagePadding>
          <Container className="space-y-9 md:space-y-14">
            <div>
              <Link
                href="/outfit-inspiration"
                className="inline-flex min-h-10 items-center font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-eg-muted)] transition-colors duration-200 hover:text-[var(--color-eg-espresso-deep)]"
              >
                ← Back to Outfit Inspiration
              </Link>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:items-center lg:gap-14 xl:gap-20">
              <div className="border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] p-2 shadow-[0_20px_56px_rgba(36,35,29,0.11)] sm:p-3">
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-eg-paper-soft)]">
                  <Image
                    src={
                      item.imageUrl ||
                      '/images/placeholder-outfit.jpg'
                    }
                    alt={item.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 55vw"
                  />

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,23,17,0.01)_0%,rgba(24,23,17,0.10)_100%)]" />
                </div>
              </div>

              <div className="space-y-6 md:space-y-7">
                <div className="flex flex-wrap items-center gap-2">
                  {item.category ? (
                    <Label className="border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)]">
                      {item.category}
                    </Label>
                  ) : null}

                  <Label
                    variant="inverse"
                    className="border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-cream)]"
                  >
                    Inspiration
                  </Label>
                </div>

                <h1 className="eg-editorial-heading max-w-3xl text-[3rem] leading-[0.95] text-[var(--color-eg-ink)] sm:text-6xl md:text-7xl lg:text-[4.75rem]">
                  {item.title}
                </h1>

                {item.description ? (
                  <p className="w-full max-w-2xl whitespace-pre-line font-serif text-base leading-8 text-[var(--color-eg-muted)] sm:text-lg md:leading-9">
                    {item.description}
                  </p>
                ) : (
                  <p className="w-full max-w-2xl font-serif text-base leading-8 text-[var(--color-eg-muted)] sm:text-lg md:leading-9">
                    Curated outfit inspiration with direct links to shop each
                    selection.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-8 border-t border-[var(--color-eg-line)] pt-10 md:space-y-10 md:pt-14">
              <div className="space-y-3 text-left md:mx-auto md:max-w-2xl md:text-center">
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-eg-muted)]">
                  Curated Pieces
                </p>

                <h2 className="eg-editorial-heading text-4xl leading-none text-[var(--color-eg-ink)] sm:text-5xl md:text-6xl">
                  Shop the Look
                </h2>
              </div>

              {shopItems.length === 0 ? (
                <div className="border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] p-8 text-center shadow-[0_12px_32px_rgba(36,35,29,0.05)] md:p-10">
                  <p className="font-serif text-sm leading-7 text-[var(--color-eg-muted)]">
                    No shop items added yet.
                  </p>
                </div>
              ) : (
                <OutfitShopGrid
                  outfitId={item.id}
                  shopItems={shopItems}
                />
              )}
            </div>

            {shopItems.length === 0 && normalizedLinks.length > 0 ? (
              <div className="space-y-7 border-t border-[var(--color-eg-line)] pt-10 md:pt-14">
                <h2 className="font-editorial text-3xl font-normal text-[var(--color-eg-ink)] md:text-4xl">
                  Links for this look
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {normalizedLinks.map((link, index) => (
                    <div
                      key={`${item.id}-link-${index}`}
                      className="flex flex-col justify-between gap-5 border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] p-5 shadow-[0_10px_28px_rgba(36,35,29,0.06)] sm:p-6"
                    >
                      <div className="space-y-2">
                        <p className="break-words text-base font-semibold leading-snug text-[var(--color-eg-ink)]">
                          {link.label}
                        </p>

                        <p className="break-all font-serif text-sm leading-6 text-[var(--color-eg-muted)]">
                          {link.readableUrl}
                        </p>
                      </div>

                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button className="min-h-11 w-full border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-eg-cream)] hover:bg-transparent hover:text-[var(--color-eg-espresso-deep)] sm:w-auto">
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