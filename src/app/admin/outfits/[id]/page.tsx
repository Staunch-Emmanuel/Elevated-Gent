"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PagePadding, Container } from "@/components/layout";

import { getOutfitById, updateOutfit } from "@/lib/firebase/outfits";
import { getWeeklyProducts } from "@/lib/firebase/weekly";
import type { OutfitDocument } from "@/lib/firebase/outfits";

export default function AdminEditOutfitPage({ params }: any) {
  const outfitId = params.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [products, setProducts] = useState<any[]>([]);

  // FORM STATE
  const [form, setForm] = useState<Partial<OutfitDocument>>({});

  // Load outfit + products
  useEffect(() => {
    async function load() {
      try {
        const outfit = await getOutfitById(outfitId);
        const productsList = await getWeeklyProducts();

        setProducts(productsList);

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
      const payload = {
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
    if (!form.products) return;

    if (form.products.includes(id)) {
      setForm({
        ...form,
        products: form.products.filter((p) => p !== id),
      });
    } else {
      setForm({
        ...form,
        products: [...form.products, id],
      });
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container className="py-12">
          <h1 className="text-3xl font-semibold mb-6">Edit Outfit</h1>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* TITLE */}
            <div>
              <label className="block font-medium mb-1">Title</label>
              <input
                className="input"
                value={form.title || ""}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block font-medium mb-1">Description</label>
              <textarea
                className="input"
                rows={3}
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            {/* HERO IMAGE */}
            <div>
              <label className="block font-medium mb-1">Hero Image URL</label>
              <input
                className="input"
                value={form.heroImage || ""}
                onChange={(e) =>
                  setForm({ ...form, heroImage: e.target.value })
                }
              />
            </div>

            {/* GALLERY */}
            <div>
              <label className="block font-medium mb-1">Gallery Images (one per line)</label>
              <textarea
                className="input"
                rows={4}
                value={(form.galleryImages || []).join("\n")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    galleryImages: e.target.value
                      .split("\n")
                      .map((x) => x.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>

            {/* OCCASION */}
            <div>
              <label className="block font-medium mb-1">Occasion</label>
              <input
                className="input"
                value={form.occasion || ""}
                onChange={(e) =>
                  setForm({ ...form, occasion: e.target.value })
                }
              />
            </div>

            {/* SEASON */}
            <div>
              <label className="block font-medium mb-1">Season</label>
              <input
                className="input"
                value={form.season || ""}
                onChange={(e) =>
                  setForm({ ...form, season: e.target.value })
                }
              />
            </div>

            {/* STYLE TYPE */}
            <div>
              <label className="block font-medium mb-1">Style Type</label>
              <input
                className="input"
                value={form.styleType || ""}
                onChange={(e) =>
                  setForm({ ...form, styleType: e.target.value })
                }
              />
            </div>

            {/* PRODUCTS SELECTOR */}
            <div>
              <label className="block font-medium mb-2">Products in this Outfit</label>

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

            {/* TOTAL PRICE */}
            <div>
              <label className="block font-medium mb-1">Total Price</label>
              <input
                type="number"
                className="input"
                value={form.totalPrice || 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    totalPrice: Number(e.target.value),
                  })
                }
              />
            </div>

            {/* FEATURED */}
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

            {/* SORT WEIGHT */}
            <div>
              <label className="block font-medium mb-1">Sort Weight</label>
              <input
                type="number"
                className="input"
                value={form.sortWeight || 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sortWeight: Number(e.target.value),
                  })
                }
              />
            </div>

            {/* SUBMIT */}
            <button
              disabled={saving}
              className="button-primary mt-6"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  );
}
