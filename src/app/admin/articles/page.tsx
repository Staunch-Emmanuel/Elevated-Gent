// src/app/admin/articles/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PagePadding, Container } from "@/components/layout";

import staticArticles from "@/lib/articles/data";
import type { ArticleDocument } from "@/lib/types/articles";
import {
  getAllArticlesCMS,
  deleteArticle,
} from "@/lib/firebase/articles";

type CombinedArticle = ArticleDocument & {
  source: "static" | "cms";
  normalizedDate: number;
};

export default function AdminArticlesPage() {
  const router = useRouter();

  const [cmsArticles, setCmsArticles] = useState<ArticleDocument[]>([]);
  const [combined, setCombined] = useState<CombinedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const cms = await getAllArticlesCMS();
      setCmsArticles(cms);

      const cmsMapped: CombinedArticle[] = cms.map((item) => ({
        ...item,
        source: "cms",
        normalizedDate: item.createdAt
          ? new Date(item.createdAt).getTime()
          : Date.now(),
      }));

      const staticMapped: CombinedArticle[] = staticArticles.map((item) => {
        const date =
          item.datePublished ||
          item.publishDate ||
          item.createdAt ||
          item.updatedAt ||
          "";
        const normalizedDate = date ? new Date(date).getTime() : Date.now();

        return {
          id: item.id,
          slug: item.slug,
          title: item.title,
          excerpt: item.excerpt,
          content: item.content,
          heroImage: item.heroImage,
          category: item.category,
          tag: item.tag,
          datePublished: item.datePublished,
          publishDate: item.publishDate,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          occasion: item.occasion,
          source: "static",
          normalizedDate,
        };
      });

      const merged = [...cmsMapped, ...staticMapped].sort(
        (a, b) => b.normalizedDate - a.normalizedDate
      );

      setCombined(merged);
      setLoading(false);
    }

    load();
  }, []);

  const filtered = combined.filter((article) => {
    const matchesSearch =
      !search ||
      (article.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (article.excerpt ?? "").toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      filterCategory === "all" ||
      (article.category ?? "general") === filterCategory;

    return matchesSearch && matchesCategory;
  });

  async function handleDelete(id: string, source: "static" | "cms") {
    if (source === "static") {
      alert("Static articles cannot be deleted from the admin.");
      return;
    }
    if (!confirm("Delete this CMS article?")) return;

    await deleteArticle(id);
    setCmsArticles((prev) => prev.filter((a) => a.id !== id));
    setCombined((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Articles (Admin)</h1>
            <button
              onClick={() => router.push("/admin/articles/new")}
              className="px-4 py-2 rounded-md bg-black text-white text-sm"
            >
              New Article
            </button>
          </div>

          <div className="flex gap-4 mb-6">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="border rounded-md px-3 py-2 text-sm w-full max-w-xs"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All categories</option>
              <option value="general">General</option>
              <option value="wellness">Wellness</option>
              <option value="style">Style</option>
              <option value="grooming">Grooming</option>
              <option value="lifestyle">Lifestyle</option>
            </select>
          </div>

          {loading && <p>Loading...</p>}

          {!loading && (
            <div className="space-y-4">
              {filtered.map((article) => (
                <div
                  key={article.id}
                  className="border rounded-lg px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {article.title ?? "Untitled article"}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full border">
                        {article.source === "static" ? "Static" : "CMS"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(article.category ?? "general").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {article.excerpt ?? ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/article/${article.slug}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                    {article.source === "cms" && (
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="text-sm text-gray-700 hover:underline"
                      >
                        Edit
                      </Link>
                    )}
                    <button
                      onClick={() =>
                        handleDelete(article.id, article.source!)
                      }
                      className="text-sm text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <p className="text-sm text-gray-500">
                  No articles match your filters yet.
                </p>
              )}
            </div>
          )}
        </Container>
      </PagePadding>
    </ProtectedRoute>
  );
}
