// src/lib/types/index.ts

// DO NOT re-export "./articles" or "./content" here – they both
// define "Article" and clash. Import them directly where needed.

// Product Types
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

// Service Types
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
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

// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "completed" | "cancelled";
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  type: "product" | "service" | "package";
  itemId: string;
  quantity: number;
  price: number;
  name: string;
}

// Cart Types
export interface CartItem {
  id: string;
  type: "product" | "service" | "package";
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Search and Filter Types
export interface SearchFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  inStock?: boolean;
  sortBy?: "price" | "name" | "created" | "popular";
  sortOrder?: "asc" | "desc";
}

export interface SearchResults<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}
