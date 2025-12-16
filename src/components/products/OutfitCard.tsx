"use client";

import Image from "next/image";
import Link from "next/link";

interface OutfitCardProps {
  outfit: {
    id: string;
    title: string;
    heroImage?: string;
    gallery?: string[];
    occasion?: string;
    styleType?: string;
    totalPrice?: number;
  };
}

export default function OutfitCard({ outfit }: OutfitCardProps) {
  const imageSrc =
    outfit.heroImage ||
    outfit.gallery?.[0] ||
    "/images/placeholder-outfit.jpg";

  return (
    <Link
      href={`/outfit-inspiration/${outfit.id}`}
      className="block rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
    >
      {/* IMAGE */}
      <div className="relative w-full h-64 bg-gray-100">
        <Image
          src={imageSrc}
          alt={outfit.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>

      {/* TEXT CONTENT */}
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold tracking-tight">
          {outfit.title}
        </h3>

        {outfit.occasion && (
          <p className="text-sm text-gray-500">{outfit.occasion}</p>
        )}

        {outfit.styleType && (
          <p className="text-sm text-gray-500">{outfit.styleType}</p>
        )}

        {typeof outfit.totalPrice === "number" && (
          <p className="font-semibold pt-1">${outfit.totalPrice}</p>
        )}
      </div>
    </Link>
  );
}
