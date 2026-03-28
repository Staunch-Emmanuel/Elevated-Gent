import Image from 'next/image'
import { PagePadding, Container } from '@/components/layout'

import OutfitInspirationClient from './OutfitInspirationClient'

import {
  getAllOutfitInspiration,
  type OutfitInspirationDocument,
} from '@/lib/firebase/outfitInspiration'

export default async function OutfitInspirationPage() {
  const cmsOutfits: OutfitInspirationDocument[] =
    await getAllOutfitInspiration()

  return (
    <>
      <section className="py-16">
        <PagePadding>
          <Container>
            <div className="text-center space-y-8">
              <div className="overflow-hidden px-4">
                <Image
                  src="/images/Outfit-Inspiration-For-Men.svg"
                  alt="Outfit Inspiration For Men"
                  width={730}
                  height={38}
                  className="mx-auto h-6 md:h-8 lg:h-10 w-auto max-w-full"
                  priority
                />
              </div>

              <p className="text-lg md:text-xl font-serif text-muted max-w-3xl mx-auto leading-relaxed px-4">
                Shop curated collections from our trusted partners. Each piece is carefully selected
                for quality, style, and versatility to help you elevate your wardrobe.
              </p>
            </div>
          </Container>
        </PagePadding>
      </section>

      <section className="py-16">
        <PagePadding>
          <Container>
            <OutfitInspirationClient cmsOutfits={cmsOutfits} />
          </Container>
        </PagePadding>
      </section>
    </>
  )
}