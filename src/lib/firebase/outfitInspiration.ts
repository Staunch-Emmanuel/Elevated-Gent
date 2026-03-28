import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "@/lib/firebase/config";

export interface OutfitInspirationDocument {
  id: string;
  title: string;
  imageUrl: string;
  links: string[];
  occasion?: string;
  season?: string;
  styleType?: string;
  featured?: boolean;
  slug?: string;
  published?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

const COLLECTION = "outfits";

function toDateValue(value: any): number {
  if (!value) return 0;

  if (typeof value === "string") {
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  if (typeof value?.toDate === "function") {
    return value.toDate().getTime();
  }

  return 0;
}

export async function getAllOutfitInspiration(): Promise<OutfitInspirationDocument[]> {
  let snap;

  try {
    const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
    snap = await getDocs(q);
  } catch {
    snap = await getDocs(collection(db, COLLECTION));
  }

  return snap.docs
    .map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        title: data.title ?? "",
        imageUrl: data.heroImage ?? data.imageUrl ?? "",
        links: Array.isArray(data.productLinks)
          ? data.productLinks
          : Array.isArray(data.links)
            ? data.links
            : [],
        occasion: data.occasion ?? "",
        season: data.season ?? "",
        styleType: data.styleType ?? "",
        featured: Boolean(data.featured),
        slug: data.slug ?? doc.id,
        published: typeof data.published === "boolean" ? data.published : true,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    })
    .filter((item) => item.published !== false)
    .sort((a, b) => toDateValue(b.createdAt) - toDateValue(a.createdAt));
}