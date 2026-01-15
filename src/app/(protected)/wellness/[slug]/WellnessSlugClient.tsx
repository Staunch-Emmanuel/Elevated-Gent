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

  if (loading) return <div>Loading...</div>;
  if (!item) return <div>Not found</div>;

  return (
    <article>
      <h1>{item.title}</h1>
      <div>{item.content}</div>
    </article>
  );
}
