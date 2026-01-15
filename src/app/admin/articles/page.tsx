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

import { reslugAllArticles } from "@/lib/firebase/articles.reslug";

type CombinedArticle = ArticleDocument & {
  source: "static" | "cms";
  normalizedDate: number;
};

export default function AdminArticlesPage() {
  const router = useRouter();

  const [combined, setCombined] = useState<CombinedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    async function load() {
      setLoading(true);

      const cms = await getAllArticlesCMS();

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

  async function handleReslugAll() {
    if (!confirm("Reslug ALL CMS articles from their titles?")) return;

    setBusy(true);
    try {
      const result = await reslugAllArticles();
      alert(
        `Reslug complete.\nUpdated ${result.updated} of ${result.total} articles.`
      );
      location.reload();
    } catch (err) {
      console.error(err);
      alert("Reslug failed. Check console.");
    } finally {
      setBusy(false);
    }
  }

  const filtered = combined.filter((article) => {
    const matchesSearch =
      !search ||
      article.title?.toLowerCase().includes(search.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      filterCategory === "all" ||
      (article.category ?? "general") === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <ProtectedRoute requireAdmin>
      <PagePadding>
        <Container>
          <div className="flex flex-wrap gap-4 justify-between mb-6">
            <h1 className="text-3xl font-bold">Articles (Admin)</h1>

            <div className="flex gap-3">
              <button
                onClick={handleReslugAll}
                disabled={busy}
                className="px-4 py-2 rounded-md border text-sm disabled:opacity-50"
              >
                {busy ? "Reslugging..." : "Reslug All Articles"}
              </button>

              <button
                onClick={() => router.push("/admin/articles/new")}
                className="px-4 py-2 rounded-md bg-black text-white text-sm"
              >
                New Article
              </button>
            </div>
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
                  className="border rounded-lg px-4 py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{article.title}</p>
                    <p className="text-xs text-gray-500">
                      /articles/{article.slug}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/articles/${article.slug}`}
                      className="text-sm text-blue-600 underline"
                    >
                      View
                    </Link>

                    {article.source === "cms" && (
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="text-sm underline"
                      >
                        Edit
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </PagePadding>
    </ProtectedRoute>
  );
}
