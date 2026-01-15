"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PagePadding, Container } from "@/components/layout";

import type { WellnessItem } from "@/lib/firebase/wellness";
import {
  getWellnessItems,
  deleteWellness,
} from "@/lib/firebase/wellness";

export default function AdminWellnessPage() {
  const router = useRouter();

  const [articles, setArticles] = useState<WellnessItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getWellnessItems();
      setArticles(data);
      setLoading(false);
    }

    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this wellness article?")) return;
    await deleteWellness(id);
    setArticles((prev) => prev.filter((a) => a.id !== id));
  }

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold">Wellness</h1>
            <Link href="/admin/wellness/new" className="button-primary">
              + New Article
            </Link>
          </div>

          {articles.length === 0 ? (
            <p>No wellness articles yet.</p>
          ) : (
            <div className="space-y-4">
              {articles.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    {item.slug && (
                      <p className="text-sm text-muted">{item.slug}</p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() =>
                        router.push(`/admin/wellness/${item.id}`)
                      }
                      className="text-sm underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-sm text-red-600 underline"
                    >
                      Delete
                    </button>
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
