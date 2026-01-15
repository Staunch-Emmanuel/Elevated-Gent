'use client';

import { useEffect, useState } from "react";

import OutfitFilterClient from "@/components/outfits/OutfitFilterClient";

import {
  weeklyProducts as staticWeeklyProducts,
  outfitLooks as staticOutfits,
} from "@/lib/products/data";

import type { OutfitLook, Product } from "@/lib/products/types";
import type { OutfitDocument } from "@/lib/firebase/admin/outfits";

import { getWeeklyProducts } from "@/lib/firebase/weekly";

interface Props {
  cmsOutfits: OutfitDocument[];
}

export default function OutfitInspirationClient({ cmsOutfits }: Props) {
  const [outfits, setOutfits] = useState<OutfitLook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // ✅ Client SDK only
        const cmsWeekly: Product[] = await getWeeklyProducts();

        const allWeeklyProducts: Product[] = [
          ...staticWeeklyProducts,
          ...cmsWeekly,
        ];

        const productMap: Record<string, Product> = {};
        allWeeklyProducts.forEach((p) => {
          productMap[p.id] = p;
        });

        const mappedCmsOutfits: OutfitLook[] = cmsOutfits.map((doc) => {
          const products: Product[] = (doc.products || [])
            .map((pid) => productMap[pid])
            .filter(Boolean);

          return {
            id: doc.slug || doc.id,
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

        setOutfits([...staticOutfits, ...mappedCmsOutfits]);
      } catch (err) {
        console.error("Failed to load outfit inspiration:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [cmsOutfits]);

  const filterMap: Record<string, string[]> = {
    all: [],
    casual: ["Casual", "Weekend", "Smart Casual"],
    formal: ["Formal Event", "Work", "Business Casual"],
    streetwear: ["Modern", "Streetwear"],
    "date-night": ["Date Night", "Cocktail Hour"],
    accessories: [],
  };

  if (loading) {
    return <p className="text-center">Loading outfits…</p>;
  }

  return (
    <OutfitFilterClient
      outfits={outfits}
      filterMap={filterMap}
    />
  );
}
