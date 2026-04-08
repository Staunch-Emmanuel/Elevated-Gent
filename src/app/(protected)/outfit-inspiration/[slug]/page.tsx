import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import { Button, Label } from '@/components/ui'

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
      (entry) => (entry.slug ?? entry.id) === slug && entry.published !== false
    ) || null

  if (!item) {
    return notFound()
  }

  const links = Array.isArray(item.links) ? item.links : []

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
      <section className="py-16">
        <PagePadding>
          <Container className="space-y-12">
            <div>
              <Link
                href="/outfit-inspiration"
                className="text-sm text-muted hover:text-black font-serif"
              >
                ← Back to Outfit Inspiration
              </Link>
            </div>

            <div className="w-full">
              <Image
                src={item.imageUrl || '/images/placeholder-outfit.jpg'}
                alt={item.title}
                width={1200}
                height={900}
                className="w-full rounded-lg object-cover"
                priority
              />
            </div>

            <div className="space-y-4 w-full">
              <div className="flex items-center gap-3 flex-wrap">
                {item.category ? <Label>{item.category}</Label> : null}
                <Label variant="inverse">Inspiration</Label>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {item.title}
              </h1>

              {item.description ? (
                <div className="w-full">
                  <p className="font-serif text-lg text-muted leading-relaxed whitespace-pre-line w-full max-w-none">
                    {item.description}
                  </p>
                </div>
              ) : (
                <div className="w-full">
                  <p className="font-serif text-lg text-muted leading-relaxed w-full max-w-none">
                    Curated outfit inspiration with direct links to shop each selection.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6 w-full">
              <h2 className="text-2xl font-bold">Links for this look</h2>

              {normalizedLinks.length === 0 ? (
                <p className="text-muted">No links added yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {normalizedLinks.map((link, index) => (
                    <div
                      key={`${item.id}-link-${index}`}
                      className="border rounded-lg p-5 space-y-4"
                    >
                      <div className="space-y-2">
                        <p className="text-base font-semibold text-black break-words">
                          {link.label}
                        </p>
                        <p className="break-all font-serif text-sm text-muted">
                          {link.readableUrl}
                        </p>
                      </div>

                      <a href={link.url} target="_blank" rel="noreferrer">
                        <Button>Open Link</Button>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Container>
        </PagePadding>
      </section>
    </ProtectedRoute>
  )
}