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
          <h1 className="mb-6 text-3xl font-bold text-[#24231d]">
            New Wellness Article
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="border border-[#d9aaa4] bg-[#fbefed] px-3 py-2 text-sm text-[#913a32]">
                {error}
              </p>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-[#817E6C]">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full border border-[#817E6C] bg-[#E8EBEC] px-3 py-2 text-sm text-[#24231d] outline-none hover:border-[#817E6C] focus:border-[#817E6C]"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#817E6C]">
                Slug
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="w-full border border-[#817E6C] bg-[#E8EBEC] px-3 py-2 text-sm text-[#24231d] outline-none hover:border-[#817E6C] focus:border-[#817E6C]"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#817E6C]">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full border border-[#817E6C] bg-[#E8EBEC] px-3 py-2 text-sm text-[#24231d] outline-none hover:border-[#817E6C] focus:border-[#817E6C]"
                rows={3}
              />
            </div>

            <CMSImageUploadField
              label="Hero Image"
              folder="wellness"
              documentSlug={slug || slugify(title)}
              mode="single"
              value={heroImage}
              onChange={(value) =>
                setHeroImage(typeof value === "string" ? value : "")
              }
              helpText="Upload the main wellness article image to Firebase Storage."
              disabled={saving}
            />

            <div>
              <label className="mb-1 block text-sm font-medium text-[#817E6C]">
                Content (HTML)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border border-[#817E6C] bg-[#24231d] px-3 py-2 font-mono text-sm text-[#E8EBEC] outline-none hover:border-[#817E6C] focus:border-[#817E6C]"
                rows={12}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-[#817E6C] px-4 py-2 text-sm text-[#E8EBEC] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Create Wellness Article"}
            </button>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  );
}