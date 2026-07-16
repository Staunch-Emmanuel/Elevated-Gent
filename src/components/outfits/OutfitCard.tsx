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
    <Link href={href} className="group block h-full">
      <div className="flex h-full cursor-pointer flex-col overflow-hidden border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] text-[var(--color-eg-ink)] shadow-[0_14px_36px_rgba(24,23,17,0.08)] transition-transform duration-300 hover:-translate-y-1">
        {/* IMAGE */}
        <div className="relative h-72 w-full overflow-hidden bg-[var(--color-eg-paper-soft)]">
          <Image
            src={image}
            alt={outfit.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,23,17,0.01)_0%,rgba(24,23,17,0.12)_100%)]" />
        </div>

        {/* TEXT */}
        {/* TEXT */}
        <div className="flex flex-1 flex-col space-y-2 p-5">
          <h3 className="font-editorial text-2xl font-normal leading-tight tracking-[-0.03em] text-[var(--color-eg-ink)]">
            {outfit.title}
          </h3>

          {outfit.occasion && (
            <p className="font-serif text-sm text-[var(--color-eg-muted)]">
              {outfit.occasion}
            </p>
          )}

          {outfit.styleType && (
            <p className="font-serif text-sm text-[var(--color-eg-muted)]">
              {outfit.styleType}
            </p>
          )}

          {outfit.totalPrice !== undefined && (
            <p className="mt-auto border-t border-[var(--color-eg-line)] pt-3 font-semibold text-[var(--color-eg-espresso-deep)]">
              ${outfit.totalPrice}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}