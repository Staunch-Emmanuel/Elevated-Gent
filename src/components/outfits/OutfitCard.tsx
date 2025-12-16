"use client";

import Image from "next/image";
import Link from "next/link";

export interface OutfitCardProps {
  outfit: {
    id: string;
    slug?: string;
    title: string;
    heroImage?: string;
    gallery?: string[];
    occasion?: string;
    styleType?: string;
    totalPrice?: number;
  };
}

export default function OutfitCard({ outfit }: OutfitCardProps) {
  const href = `/outfit-inspiration/${outfit.slug || outfit.id}`;

  const image =
    outfit.heroImage ||
    outfit.gallery?.[0] ||
    "/images/placeholder-outfit.jpg";

  return (
    <Link href={href}>
      <div className="group rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition cursor-pointer">
        {/* IMAGE */}
        <div className="relative w-full h-64">
          <Image
            src={image}
            alt={outfit.title}
            fill
            className="object-cover group-hover:scale-105 transition duration-300"
          />
        </div>

        {/* TEXT */}
        {/* TEXT */}
<div className="p-4 space-y-1">
  <h3 className="text-lg font-semibold tracking-tight">
    {outfit.title}
  </h3>

  {outfit.occasion && (
    <p className="text-sm text-gray-500">{outfit.occasion}</p>
  )}

  {outfit.styleType && (
    <p className="text-sm text-gray-500">{outfit.styleType}</p>
  )}

  {outfit.totalPrice !== undefined && (
    <p className="font-semibold pt-1">${outfit.totalPrice}</p>
  )}
</div>

      </div>
    </Link>
  );
}
