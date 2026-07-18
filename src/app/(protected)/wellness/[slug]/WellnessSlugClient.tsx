"use client";

import { useEffect, useState } from "react";
import { getWellnessItemBySlug, WellnessItem } from "@/lib/firebase/wellness";

interface Props {
  slug: string;
}

export default function WellnessSlugClient({ slug }: Props) {
  const [item, setItem] = useState<WellnessItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchItem() {
      const data = await getWellnessItemBySlug(slug);
      if (!cancelled) {
        setItem(data);
        setLoading(false);
      }
    }

    fetchItem();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-eg-espresso)] px-6 py-20 text-center font-serif text-[var(--color-text-muted)]">
        Loading...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[var(--color-eg-espresso)] px-6 py-20 text-center font-serif text-[var(--color-text-muted)]">
        Not found
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-[var(--color-eg-paper)] px-6 py-16 text-[var(--color-eg-ink)] md:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="eg-editorial-heading mb-8 text-5xl text-[var(--color-eg-ink)] md:text-7xl">
          {item.title}
        </h1>

        <div className="prose max-w-none">
          {item.content}
        </div>
      </div>
    </article>
  );
}