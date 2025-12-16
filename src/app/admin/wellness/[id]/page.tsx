// src/app/admin/wellness/[id]/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PagePadding, Container } from "@/components/layout";
import {
  getWellnessById,
  updateWellness,
  deleteWellness,
} from "@/lib/firebase/wellness";
import type { ArticleDocument } from "@/lib/types/articles";

interface PageProps {
  params: { id: string };
}

export default function AdminEditWellnessPage({ params }: PageProps) {
  const router = useRouter();
  const wellnessId = params.id;

  const [article, setArticle] = useState<ArticleDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const doc = await getWellnessById(wellnessId);
      if (!doc) {
        setError("Wellness article not found");
        setLoading(false);
        return;
      }

      setArticle(doc);
      setTitle(doc.title ?? "");
      setSlug(doc.slug ?? "");
      setExcerpt(doc.excerpt ?? "");
      setHeroImage(doc.heroImage ?? "");
      setContent(doc.content ?? "");
      setLoading(false);
    }

    load();
  }, [wellnessId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!article) return;

    setSaving(true);
    setError("");

    try {
      await updateWellness(wellnessId, {
        title,
        slug,
        excerpt,
        heroImage,
        content,
      });
      router.push("/admin/wellness");
    } catch (err) {
      console.error(err);
      setError("Failed to update wellness article.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this wellness article?")) return;
    await deleteWellness(wellnessId);
    router.push("/admin/wellness");
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <PagePadding>
          <Container>
            <p>Loading...</p>
          </Container>
        </PagePadding>
      </ProtectedRoute>
    );
  }

  if (!article) {
    return (
      <ProtectedRoute>
        <PagePadding>
          <Container>
            <p>Wellness article not found.</p>
          </Container>
        </PagePadding>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container className="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Edit Wellness Article</h1>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 rounded-md border border-red-500 text-red-600 text-xs"
            >
              Delete
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-600 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Hero image URL
              </label>
              <input
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Content (HTML)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm font-mono"
                rows={12}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-black text-white text-sm disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  );
}
