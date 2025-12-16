"use client";

import { useState } from "react";
import OutfitCard from "@/components/products/OutfitCard";

/* TYPES -------------------------------------------------- */

export interface Outfit {
  id: string;
  title: string;
  heroImage?: string;
  gallery?: string[];
  occasion?: string;
  styleType?: string;
  totalPrice?: number;
  products: any[];
}

export interface FilterMap {
  [key: string]: string[];
}

interface Props {
  outfits: Outfit[];
  filterMap: FilterMap;
}

/* COMPONENT ------------------------------------------------ */

export default function OutfitFilterClient({ outfits, filterMap }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  /* FILTER LOGIC ------------------------------------------ */
  const filteredOutfits: Outfit[] =
    activeFilter === "all"
      ? outfits
      : outfits.filter((o) => {
          const terms = filterMap[activeFilter] || [];
          return (
            terms.includes(o.occasion || "") ||
            terms.includes(o.styleType || "")
          );
        });

  /* UI ----------------------------------------------------- */
  return (
    <div className="space-y-12">
      {/* FILTER BUTTONS */}
      <div className="flex flex-wrap gap-2 justify-center">
        {Object.keys(filterMap).map((key) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`px-4 py-2 rounded-full text-sm transition ${
              activeFilter === key
                ? "bg-black text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {key.replace("-", " ").toUpperCase()}
          </button>
        ))}
      </div>

      {/* OUTFIT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredOutfits.map((outfit) => (
          <OutfitCard key={outfit.id} outfit={outfit} />
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredOutfits.length === 0 && (
        <p className="text-center text-gray-500 font-serif py-12">
          No outfits found in this category yet.
        </p>
      )}
    </div>
  );
}
