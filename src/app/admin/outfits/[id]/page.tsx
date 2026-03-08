"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PagePadding, Container } from "@/components/layout";
import CMSImageUploadField from "@/components/admin/CMSImageUploadField";

import { getOutfitById, updateOutfit } from "@/lib/firebase/outfits";
import { getWeeklyProducts } from "@/lib/firebase/weekly";
import type { OutfitDocument } from "@/lib/firebase/outfits";

type AdminEditOutfitPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type WeeklyProduct = {
  id: string;
  title: string;
};

function slugify(text: string): string {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminEditOutfitPage({
  params,
}: AdminEditOutfitPageProps) {
  const router = useRouter();

  const [outfitId, setOutfitId] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [products, setProducts] = useState<WeeklyProduct[]>([]);
  const [form, setForm] = useState<Partial<OutfitDocument>>({
    galleryImages: [],
    products: [],
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resolved = await params;
        if (!mounted) return;
        setOutfitId(resolved.id);
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
      if (!outfitId) return;

      try {
        const outfit = await getOutfitById(outfitId);
        const productsList = await getWeeklyProducts();

        setProducts(productsList as WeeklyProduct[]);

        if (outfit) {
          setForm({
            title: outfit.title,
            description: outfit.description,
            heroImage: outfit.heroImage,
            galleryImages: outfit.galleryImages || [],
            occasion: outfit.occasion,
            season: outfit.season,
            styleType: outfit.styleType,
            products: outfit.products || [],
            totalPrice: outfit.totalPrice,
            featured: outfit.featured,
            sortWeight: outfit.sortWeight,
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load outfit.");
      }

      setLoading(false);
    }

    load();
  }, [outfitId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload: Partial<OutfitDocument> = {
        ...form,
        galleryImages: (form.galleryImages || []).map((x) => x.trim()),
        products: form.products || [],
        totalPrice: Number(form.totalPrice) || 0,
        sortWeight: Number(form.sortWeight) || 0,
      };

      await updateOutfit(outfitId, payload);
      router.push("/admin/outfits");
    } catch (err) {
      console.error(err);
      setError("Failed to update outfit.");
    }

    setSaving(false);
  }

  const toggleProduct = (id: string) => {
    const currentProducts = form.products || [];

    if (currentProducts.includes(id)) {
      setForm({
        ...form,
        products: currentProducts.filter((p) => p !== id),
      });
    } else {
      setForm({
        ...form,
        products: [...currentProducts, id],
      });
    }
  };

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

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container className="py-12">
          <h1 className="text-3xl font-semibold mb-6">Edit Outfit</h1>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium mb-1">Title</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                URL slug will be:
                <span className="ml-1 font-mono">
                  /outfit-inspiration/{slugify(form.title || "")}
                </span>
              </p>
            </div>

            <div>
              <label className="block font-medium mb-1">Description</label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm"
                rows={3}
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <CMSImageUploadField
              label="Hero Image"
              folder="outfits"
              documentSlug={slugify(form.title || "")}
              mode="single"
              value={form.heroImage || ""}
              onChange={(value) =>
                setForm({
                  ...form,
                  heroImage: typeof value === "string" ? value : "",
                })
              }
              helpText="Replace or remove the main outfit image."
              disabled={saving}
            />

            <CMSImageUploadField
              label="Gallery Images"
              folder="outfits"
              documentSlug={slugify(form.title || "")}
              mode="multiple"
              value={Array.isArray(form.galleryImages) ? form.galleryImages : []}
              onChange={(value) =>
                setForm({
                  ...form,
                  galleryImages: Array.isArray(value) ? value : [],
                })
              }
              helpText="Optional extra outfit gallery images."
              disabled={saving}
            />

            <div>
              <label className="block font-medium mb-1">Occasion</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={form.occasion || ""}
                onChange={(e) => setForm({ ...form, occasion: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Season</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={form.season || ""}
                onChange={(e) => setForm({ ...form, season: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Style Type</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={form.styleType || ""}
                onChange={(e) =>
                  setForm({ ...form, styleType: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Products in this Outfit
              </label>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {products.map((p) => (
                  <label key={p.id} className="border p-2 rounded">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={form.products?.includes(p.id)}
                      onChange={() => toggleProduct(p.id)}
                    />
                    {p.title}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Total Price</label>
              <input
                type="number"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={form.totalPrice || 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    totalPrice: Number(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Featured</label>
              <input
                type="checkbox"
                checked={form.featured || false}
                onChange={(e) =>
                  setForm({ ...form, featured: e.target.checked })
                }
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Sort Weight</label>
              <input
                type="number"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={form.sortWeight || 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sortWeight: Number(e.target.value),
                  })
                }
              />
            </div>

            <button
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