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
  featured?: boolean;
  slug?: string;
  published?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

const COLLECTION = "outfitInspiration";

export async function getAllOutfitInspiration(): Promise<OutfitInspirationDocument[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      title: data.title ?? "",
      imageUrl: data.imageUrl ?? "",
      links: Array.isArray(data.links) ? data.links : [],
      occasion: data.occasion ?? "",
      featured: Boolean(data.featured),
      slug: data.slug ?? doc.id,
      published: typeof data.published === "boolean" ? data.published : true,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }).filter(item => item.published !== false);
}