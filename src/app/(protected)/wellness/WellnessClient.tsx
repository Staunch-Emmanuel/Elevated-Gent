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

  if (loading) return <div>Loading...</div>;

  return (
    <section>
      <h1 className="text-3xl font-semibold mb-6">Wellness</h1>

      {items.length === 0 && (
        <p className="text-gray-600">No wellness items yet.</p>
      )}
    </section>
  );
}
