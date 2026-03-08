"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PagePadding, Container } from "@/components/layout";
import CMSImageUploadField from "@/components/admin/CMSImageUploadField";

import {
  getArticleById,
  updateArticle,
  deleteArticle,
} from "@/lib/firebase/articles";

import type { ArticleDocument } from "@/lib/types/articles";

interface PageProps {
  params: Promise<{ id: string }>;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminEditArticlePage({ params }: PageProps) {
  const router = useRouter();

  const [articleId, setArticleId] = useState<string>("");

  const [article, setArticle] = useState<ArticleDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("general");
  const [heroImage, setHeroImage] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resolved = await params;
        if (!mounted) return;
        setArticleId(resolved.id);
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        setError("Invalid route params.");
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params]);

  useEffect(() => {
    async function load() {
      if (!articleId) return;

      setLoading(true);
      const doc = await getArticleById(articleId);

      if (!doc) {
        setError("Article not found");
        setLoading(false);
        return;
      }

      setArticle(doc);
      setTitle(doc.title ?? "");
      setExcerpt(doc.excerpt ?? "");
      setCategory(doc.category ?? "general");
      setHeroImage(doc.heroImage ?? "");
      setContent(doc.content ?? "");
      setLoading(false);
    }

    load();
  }, [articleId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!article) return;

    setSaving(true);
    setError("");

    const slug = slugify(title);

    if (!slug) {
      setError("Invalid title. Slug could not be generated.");
      setSaving(false);
      return;
    }

    try {
      await updateArticle(articleId, {
        title,
        slug,
        excerpt,
        category,
        heroImage,
        content,
      });

      router.push("/admin/articles");
    } catch (err) {
      console.error(err);
      setError("Failed to update article.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this article?")) return;
    await deleteArticle(articleId);
    router.push("/admin/articles");
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
            <p>Article not found.</p>
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
            <h1 className="text-3xl font-bold">Edit Article</h1>
            <button
              type="button"
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
              <p className="text-xs text-gray-500 mt-1">
                URL slug will be:
                <span className="ml-1 font-mono">/articles/{slugify(title)}</span>
              </p>
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
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="general">General</option>
                <option value="wellness">Wellness</option>
                <option value="style">Style</option>
                <option value="grooming">Grooming</option>
                <option value="lifestyle">Lifestyle</option>
              </select>
            </div>

            <CMSImageUploadField
              label="Hero Image"
              folder="articles"
              documentSlug={slugify(title)}
              mode="single"
              value={heroImage}
              onChange={(value) => setHeroImage(typeof value === "string" ? value : "")}
              helpText="Replace or remove the current article hero image."
              disabled={saving}
            />

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