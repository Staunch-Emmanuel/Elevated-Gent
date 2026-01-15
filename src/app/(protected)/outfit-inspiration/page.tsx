// src/app/outfit-inspiration/page.tsx

import { PagePadding, Container } from "@/components/layout";
import Image from "next/image";

import {
  getAllOutfitsPublic,
  type OutfitDocument,
} from "@/lib/firebase/admin/outfits";

import OutfitInspirationClient from "./OutfitInspirationClient";

export default async function OutfitInspirationPage() {
  // ✅ Admin SDK allowed here
  const cmsOutfits: OutfitDocument[] = await getAllOutfitsPublic();

  return (
    <section className="py-16">
      <PagePadding>
        <Container className="space-y-10">
          <div className="text-center space-y-6">
            <Image
              src="/images/Outfit-Inspiration-For-Men.svg"
              alt="Outfit Inspiration For Men"
              width={730}
              height={38}
              className="mx-auto h-6 md:h-8 lg:h-10 w-auto"
            />

            <p className="text-lg md:text-xl font-serif text-muted max-w-3xl mx-auto">
              Shop curated outfit combinations built from Weekly Finds.
            </p>
          </div>

          {/* ⬇️ PASS DATA DOWN */}
          <OutfitInspirationClient cmsOutfits={cmsOutfits} />
        </Container>
      </PagePadding>
    </section>
  );
}
