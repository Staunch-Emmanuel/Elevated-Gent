"use client";

import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { slugify } from "@/lib/utils/slugify";

const COLLECTION = "articles";

export async function reslugAllArticles(): Promise<{
  total: number;
  updated: number;
}> {
  const snap = await getDocs(collection(db, COLLECTION));

  let updated = 0;

  for (const d of snap.docs) {
    const data = d.data();
    const title = (data.title || "").trim();
    if (!title) continue;

    const correctSlug = slugify(title);

    if (data.slug !== correctSlug) {
      await updateDoc(doc(db, COLLECTION, d.id), {
        slug: correctSlug,
        updatedAt: new Date().toISOString(),
      });
      updated++;
    }
  }

  return {
    total: snap.size,
    updated,
  };
}
