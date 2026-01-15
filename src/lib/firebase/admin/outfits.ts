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
}

export async function getAllOutfitsPublic(): Promise<OutfitDocument[]> {
  const snap = await adminDb
    .collection("outfits")
    .where("published", "==", true)
    .get();

  return snap.docs.map((doc) => {
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
      totalPrice: data.totalPrice ?? 0,
      featured: Boolean(data.featured),
    };
  });
}
