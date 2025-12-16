// src/app/admin/wellness/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PagePadding, Container } from "@/components/layout";
import type { ArticleDocument } from "@/lib/types/articles";
import {
  getWellnessArticles,
  deleteWellness,
} from "@/lib/firebase/wellness";

export default function AdminWellnessPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const cms = await getWellnessArticles();
      setArticles(cms);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this wellness article?")) return;
    await deleteWellness(id);
    setArticles((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Wellness (Admin)</h1>
            <button
              onClick={() => router.push("/admin/wellness/new")}
              className="px-4 py-2 rounded-md bg-black text-white text-sm"
            >
              New Wellness Article
            </button>
          </div>

          {loading && <p>Loading...</p>}

          {!loading && (
            <div className="space-y-4">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="border rounded-lg px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <p className="font-medium">
                      {article.title ?? "Untitled article"}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {article.excerpt ?? ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/wellness/${article.slug}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/wellness/${article.id}`}
                      className="text-sm text-gray-700 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="text-sm text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {articles.length === 0 && (
                <p className="text-sm text-gray-500">
                  No wellness articles yet.
                </p>
              )}
            </div>
          )}
        </Container>
      </PagePadding>
    </ProtectedRoute>
  );
}
