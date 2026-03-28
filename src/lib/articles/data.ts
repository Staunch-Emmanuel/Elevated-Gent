// src/lib/articles/data.ts
import type { Article } from "@/lib/types/articles";

export const staticArticles: Article[] = [];

export default staticArticles;

export function getStaticArticleBySlug(_slug: string): Article | null {
  return null;
}