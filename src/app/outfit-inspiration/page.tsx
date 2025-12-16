// src/app/outfit-inspiration/page.tsx

import { PagePadding, Container } from "@/components/layout";
import Image from "next/image";
import { StructuredData } from "@/components/seo/StructuredData";

import {
  weeklyProducts as staticWeeklyProducts,
  outfitLooks as staticOutfits,
} from "@/lib/products/data";

import type { OutfitLook, Product } from "@/lib/products/types";

import { getWeeklyProducts } from "@/lib/firebase/weekly";
import {
  getAllOutfitsPublic,
  type OutfitDocument,
} from "@/lib/firebase/outfits";

import OutfitFilterClient from "@/components/outfits/OutfitFilterClient";

export default async function OutfitInspirationPage() {
  // 1) Load CMS outfits (IDs + meta)
  const cmsDocs: OutfitDocument[] = await getAllOutfitsPublic();

  // 2) Build product map from Weekly (static + CMS)
  const cmsWeekly: Product[] = await getWeeklyProducts();
  const allWeeklyProducts: Product[] = [...staticWeeklyProducts, ...cmsWeekly];

  const productMap: Record<string, Product> = {};
  allWeeklyProducts.forEach((p) => {
    productMap[p.id] = p;
  });

  // 3) Convert OutfitDocument → OutfitLook (real Product[] instead of string IDs)
  const cmsOutfits: OutfitLook[] = cmsDocs.map((doc) => {
    // make sure URL-friendly id works as slug for public routing
    const slugId = doc.slug || doc.id;

    const products: Product[] = (doc.products || [])
      .map((pid: string) => productMap[pid])
      .filter((p): p is Product => Boolean(p));

    return {
      id: slugId,
      title: doc.title,
      description: doc.description,
      heroImage: doc.heroImage,
      occasion: doc.occasion,
      season: doc.season,
      styleType: doc.styleType,
      products,
      totalPrice: doc.totalPrice ?? 0,
      featured: !!doc.featured,
    };
  });

  // 4) Merge STATIC + CMS outfits
  const allOutfits: OutfitLook[] = [...staticOutfits, ...cmsOutfits];

  // 5) Filter map (same logic as before)
  const filterMap: Record<string, string[]> = {
    all: [],
    casual: ["Casual", "Weekend", "Smart Casual"],
    formal: ["Formal Event", "Work", "Business Casual"],
    streetwear: ["Modern", "Streetwear"],
    "date-night": ["Date Night", "Cocktail Hour"],
    accessories: [],
  };

  return (
    <>
      <StructuredData pageKey="outfit-inspiration" />

      <section className="py-16">
        <PagePadding>
          <Container className="space-y-10">
            {/* HERO */}
            <div className="text-center space-y-6">
              <Image
                src="/images/Outfit-Inspiration-For-Men.svg"
                alt="Outfit Inspiration For Men"
                width={730}
                height={38}
                className="mx-auto h-6 md:h-8 lg:h-10 w-auto max-w-full"
              />
              <p className="text-lg md:text-xl font-serif text-muted max-w-3xl mx-auto leading-relaxed px-4">
                Shop curated outfit combinations built from Weekly Finds. Every
                look is constructed from real products, so you can recreate each
                fit piece by piece.
              </p>
            </div>

            {/* FILTER + GRID (client component) */}
            <OutfitFilterClient outfits={allOutfits} filterMap={filterMap} />
          </Container>
        </PagePadding>
      </section>
    </>
  );
}
