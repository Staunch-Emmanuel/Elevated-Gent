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

  const serializedOutfits = cmsOutfits.map((outfit) => serializeOutfit(outfit))

  return (
    <>
      <section className="py-16 bg-[var(--color-eg-espresso)] text-[var(--color-eg-cream)]">
        <PagePadding>
          <Container>
            <div className="text-center space-y-8">
              <div className="overflow-hidden px-4">
                <h1 className="eg-editorial-heading text-5xl md:text-7xl lg:text-8xl text-[var(--color-eg-cream)]">
                  OUTFIT INSPIRATION
                </h1>
              </div>

              <p className="text-lg md:text-xl font-serif text-[rgba(239,230,216,0.78)] max-w-3xl mx-auto leading-relaxed px-4">
                Shop our curated selection of the most stylish outfits. Each piece is carefully selected for quality, style, and versatility to help you elevate your wardrobe.
              </p>
            </div>
          </Container>
        </PagePadding>
      </section>

      <section className="py-16 bg-[var(--color-eg-paper)]">
        <PagePadding>
          <Container>
            <OutfitInspirationClient cmsOutfits={serializedOutfits} />
          </Container>
        </PagePadding>
      </section>
    </>
  )
}