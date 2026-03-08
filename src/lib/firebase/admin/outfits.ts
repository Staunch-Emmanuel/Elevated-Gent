import { adminDb } from "./init";

export interface OutfitDocument {
  id: string;
  slug?: string;
  title: string;
  description: string;
  heroImage: string;
  occasion: string;
  season: string;
  styleType: string;
  products: string[];
  totalPrice?: number;
  featured?: boolean;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function getAllOutfitsPublic(): Promise<OutfitDocument[]> {
  const snap = await adminDb.collection("outfits").get();

  return snap.docs
    .map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        slug: data.slug ?? doc.id,
        title: data.title ?? "",
        description: data.description ?? "",
        heroImage: data.heroImage ?? "",
        occasion: data.occasion ?? "",
        season: data.season ?? "",
        styleType: data.styleType ?? "",
        products: Array.isArray(data.products) ? data.products : [],
        totalPrice: typeof data.totalPrice === "number" ? data.totalPrice : 0,
        featured: Boolean(data.featured),
        published: typeof data.published === "boolean" ? data.published : true,
        createdAt: data.createdAt ?? "",
        updatedAt: data.updatedAt ?? "",
      };
    })
    .filter((item) => item.published !== false)
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
}