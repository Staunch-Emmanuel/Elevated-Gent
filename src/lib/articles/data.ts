// src/lib/articles/data.ts
import type { Article } from "@/lib/types/articles";

// Put your real static articles here.
// For now we keep one demo so the wiring works.
export const staticArticles: Article[] = [
  {
    id: "modern-mens-hair-styling-guide",
    slug: "modern-mens-hair-styling-guide",
    title: "Modern Men’s Hair Styling Guide",
    excerpt: "A simple framework to style your hair like a modern gentleman.",
    content: "<p>Replace this with your HTML or markdown-rendered content.</p>",
    heroImage: "/images/demo-hair.jpg",
    category: "wellness",
    tag: "hair",
    datePublished: "2024-01-01T00:00:00.000Z",
    publishDate: "2024-01-01T00:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    occasion: "daily",
  },
];

export default staticArticles;

// Helper: get by slug for public pages
export function getStaticArticleBySlug(slug: string): Article | null {
  return staticArticles.find((a) => a.slug === slug) ?? null;
}
