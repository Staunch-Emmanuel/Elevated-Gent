// Unified Article type used everywhere in the project
export interface ArticleDocument {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;

  category: string;
  heroImage: string;

  source: "static" | "cms"; // identifies article source

  createdAt: number;       // CMS timestamp
  updatedAt: number;       // CMS timestamp
  normalizedDate: number;  // used for sorting static + CMS together
}

// Optional helper types
export type ArticleCategory =
  | "general"
  | "grooming"
  | "wellness"
  | "style"
  | "lifestyle";

export interface AffiliateProduct {
  id: string;
  name: string;
  brand: string;
  price: string;
  priceValue: number;
  image: string;
  description: string;
  affiliateLink: string;
  retailer: string;
  tier: string;
}

export type ArticleOccasion =
  | "daily"
  | "evening"
  | "business"
  | "formal"
  | "casual";
