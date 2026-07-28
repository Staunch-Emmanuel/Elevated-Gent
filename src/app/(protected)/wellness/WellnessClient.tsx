"use client";

import { useEffect, useState } from "react";
import { getWellnessItemBySlug } from "@/lib/firebase/wellness";
import type { WellnessItem } from "@/lib/firebase/wellness";

export default function WellnessClient() {
  const [items, setItems] = useState<WellnessItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchItems() {
      /**
       * TEMP SAFE BEHAVIOUR
       * If you don’t yet have a "getAllWellnessItems",
       * we avoid calling a function that doesn’t exist.
       *
       * This keeps the app BUILDABLE.
       */
      setItems([]);
      setLoading(false);
    }

    fetchItems();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-eg-espresso)] px-6 py-20 text-center font-serif text-[var(--color-text-muted)]">
        Loading...
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[var(--color-eg-espresso)] px-6 py-20 text-[var(--color-eg-cream)] md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 space-y-4 text-center">
          <p className="font-sans text-[11px] font-medium uppercase tracking-[0.34em] text-[var(--color-text-secondary)]">
            Health and Wellbeing
          </p>

          <h1 className="eg-editorial-heading text-5xl text-[var(--color-eg-cream)] md:text-7xl">
            Wellness
          </h1>
        </div>

        {items.length === 0 && (
          <div className="border border-[var(--color-eg-line-light)] bg-[rgba(232,235,236,0.06)] p-8 text-center">
            <p className="font-serif text-[var(--color-text-muted)]">
              No wellness items yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}