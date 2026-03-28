import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import { Button, Label } from '@/components/ui'

import { getAllOutfitInspiration } from '@/lib/firebase/outfitInspiration'

export default async function OutfitInspirationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const items = await getAllOutfitInspiration()

  const item =
    items.find((entry) => (entry.slug ?? entry.id) === slug && entry.published !== false) || null

  if (!item) {
    return notFound()
  }

  const links = Array.isArray(item.links) ? item.links.filter(Boolean) : []

  return (
    <ProtectedRoute>
      <section className="py-16">
        <PagePadding>
          <Container className="space-y-12">

            {/* ✅ BACK LINK */}
            <div>
              <Link
                href="/outfit-inspiration"
                className="text-sm text-muted hover:text-black font-serif"
              >
                ← Back to Outfit Inspiration
              </Link>
            </div>

            {/* IMAGE */}
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

            {/* HEADER */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                {item.occasion ? <Label>{item.occasion}</Label> : null}
                <Label variant="inverse">Inspiration</Label>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {item.title}
              </h1>

              <p className="font-serif text-lg max-w-3xl text-muted">
                Curated outfit inspiration with direct links to shop each selection.
              </p>
            </div>

            {/* LINKS */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Links for this look</h2>

              {links.length === 0 ? (
                <p className="text-muted">No links added yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {links.map((link, index) => (
                    <div
                      key={`${item.id}-link-${index}`}
                      className="border rounded-lg p-5 space-y-4"
                    >
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wide text-muted">
                          Link {index + 1}
                        </p>
                        <p className="break-all font-serif text-sm">{link}</p>
                      </div>

                      <a href={link} target="_blank" rel="noreferrer">
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