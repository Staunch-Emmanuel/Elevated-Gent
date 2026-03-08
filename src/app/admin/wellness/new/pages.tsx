"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PagePadding, Container } from "@/components/layout";
import CMSImageUploadField from "@/components/admin/CMSImageUploadField";
import { createWellness } from "@/lib/firebase/wellness";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminNewWellnessPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slug) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await createWellness({
        title,
        slug,
        excerpt,
        heroImage,
        content,
      });

      router.push("/admin/wellness");
    } catch (err) {
      console.error(err);
      setError("Failed to create wellness article. Please try again.");
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-6">New Wellness Article</h1>

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
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
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

            <CMSImageUploadField
              label="Hero Image"
              folder="wellness"
              documentSlug={slug || slugify(title)}
              mode="single"
              value={heroImage}
              onChange={(value) => setHeroImage(typeof value === "string" ? value : "")}
              helpText="Upload the main wellness article image to Firebase Storage."
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
              {saving ? "Saving..." : "Create Wellness Article"}
            </button>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  );
}