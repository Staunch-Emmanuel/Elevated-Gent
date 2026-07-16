import { PagePadding, Container } from '@/components/layout'

import OutfitInspirationClient from './OutfitInspirationClient'

import {
  getAllOutfitInspiration,
  type OutfitInspirationDocument,
} from '@/lib/firebase/outfitInspiration'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function serializeDate(value: unknown): string | undefined {
  if (!value) return undefined

  if (typeof value === 'string') {
    return value
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: unknown }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString()
  }

  return undefined
}

function serializeOutfit(
  outfit: OutfitInspirationDocument
): OutfitInspirationDocument {
  return {
    ...outfit,
    createdAt: serializeDate(outfit.createdAt),
    updatedAt: serializeDate(outfit.updatedAt),
  }
}

export default async function OutfitInspirationPage() {
  const cmsOutfits: OutfitInspirationDocument[] =
    await getAllOutfitInspiration()

  const serializedOutfits = cmsOutfits.map((outfit) =>
    serializeOutfit(outfit)
  )

  return (
    <div className="min-h-screen bg-[var(--color-eg-espresso)] text-[var(--color-eg-cream)]">
      <section className="border-b border-[var(--color-eg-line-light)] bg-[var(--color-eg-espresso-deep)] py-20 md:py-24 lg:py-28">
        <PagePadding>
          <Container>
            <div className="mx-auto max-w-5xl space-y-7 text-center md:space-y-8">
              <p className="font-sans text-[11px] font-medium uppercase tracking-[0.34em] text-[var(--color-text-secondary)]">
                Curated Style
              </p>

              <div className="overflow-hidden px-2 sm:px-4">
                <h1 className="eg-editorial-heading text-[3.4rem] text-[var(--color-eg-cream)] sm:text-6xl md:text-7xl lg:text-[6.5rem]">
                  OUTFIT INSPIRATION
                </h1>
              </div>

              <p className="mx-auto max-w-3xl px-2 font-serif text-base leading-8 text-[var(--color-text-muted)] sm:px-4 sm:text-lg md:text-xl md:leading-9">
                Shop our curated selection of the most stylish outfits. Each
                piece is carefully selected for quality, style, and versatility
                to help you elevate your wardrobe.
              </p>
            </div>
          </Container>
        </PagePadding>
      </section>

      <section className="bg-[var(--color-eg-espresso)] py-16 md:py-20 lg:py-24">
        <PagePadding>
          <Container>
            <OutfitInspirationClient cmsOutfits={serializedOutfits} />
          </Container>
        </PagePadding>
      </section>
    </div>
  )
}