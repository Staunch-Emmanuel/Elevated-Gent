// src/lib/types/index.ts

// =========================
// SUBSCRIPTION
// =========================

export type SubscriptionStatus = "active" | "inactive" | "past_due" | null;

// =========================
// WELLNESS
// =========================

export interface WellnessItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
}

// =========================
// PRODUCTS
// =========================

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  affiliateUrl?: string;
  inStock: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// =========================
// SERVICES
// =========================

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: "styling" | "consultation" | "wardrobe";
  features: string[];
  popular?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  services: Service[];
  totalPrice: number;
  discountedPrice?: number;
  popular?: boolean;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}
