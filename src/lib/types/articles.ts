// src/lib/types/articles.ts

export type ArticleCategory =
  | "general"
  | "wellness"
  | "style"
  | "grooming"
  | "lifestyle"
  | string;

export type ArticleOccasion =
  | "daily"
  | "weekly"
  | "event"
  | "special"
  | string;

// Base article shape used by frontend (static + CMS)
export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  heroImage?: string;
  category: ArticleCategory;
  tag?: string;
  datePublished?: string; // for static content
  publishDate?: string;   // alias
  createdAt?: string;     // CMS timestamps
  updatedAt?: string;
  occasion?: ArticleOccasion;
}

// Firestore document-ish version
export interface ArticleDocument {
  id: string; // Firestore doc id
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  heroImage?: string;
  category?: ArticleCategory;
  tag?: string;
  datePublished?: string;
  publishDate?: string;
  createdAt?: string;
  updatedAt?: string;
  occasion?: ArticleOccasion;

  // extra fields used only in admin / merging logic
  source?: "static" | "cms";
  normalizedDate?: number;
}

// Simple affiliate product (used in sidebars/CTAs)
export interface AffiliateProduct {
  id: string;
  name: string;
  brand: string;
  price: string;
  priceValue?: number;
  image: string;
  description: string;
  affiliateLink: string;
  retailer?: string;
  tier?: "budget" | "mid" | "premium" | "signature" | string;
}
