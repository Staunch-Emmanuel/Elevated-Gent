"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PagePadding, Container } from "@/components/layout";

import {
  getAllOutfits,
  deleteOutfit,
} from "@/lib/firebase/outfits";

import type { OutfitDocument } from "@/lib/firebase/outfits";

const OCCASION_OPTIONS = [
  "Work",
  "Casual",
  "Date Night",
  "Travel",
  "Weekend",
  "Formal Event",
  "Cocktail Hour",
  "Seasonal",
];

const SEASON_OPTIONS = ["Spring", "Summer", "Fall", "Winter", "All Seasons"];

const STYLE_TYPES = [
  "Minimalist",
  "Classic",
  "Modern",
  "Streetwear",
  "Business Casual",
  "Smart Casual",
  "Formal",
  "Casual",
];

export default function AdminOutfitsPage() {
  const router = useRouter();

  const [outfits, setOutfits] = useState<OutfitDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterOccasion, setFilterOccasion] = useState("all");
  const [filterSeason, setFilterSeason] = useState("all");
  const [filterStyle, setFilterStyle] = useState("all");

  // Load all outfits
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const docs = await getAllOutfits();
        setOutfits(docs);
      } catch (err) {
        console.error("Error loading outfits:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Delete handler
  async function handleDelete(id: string) {
    if (!confirm("Delete this outfit?")) return;

    try {
      setDeletingId(id);
      await deleteOutfit(id);
      setOutfits((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete outfit.");
    } finally {
      setDeletingId(null);
    }
  }

  // Filtering + search
  const filtered = outfits.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    const matchOccasion =
      filterOccasion === "all" || item.occasion === filterOccasion;

    const matchSeason =
      filterSeason === "all" || item.season === filterSeason;

    const matchStyle =
      filterStyle === "all" || item.styleType === filterStyle;

    return matchSearch && matchOccasion && matchSeason && matchStyle;
  });

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container className="py-12 max-w-5xl">

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl font-bold">Outfits (Admin)</h1>

            <Link
              href="/admin/outfits/new"
              className="bg-black text-white px-4 py-2 rounded text-sm"
            >
              + New Outfit
            </Link>
          </div>

          {/* Filters */}
          <div className="space-y-4 mb-10">
            <input
              placeholder="Search outfits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded w-full"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <select
                value={filterOccasion}
                onChange={(e) => setFilterOccasion(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="all">All Occasions</option>
                {OCCASION_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>

              <select
                value={filterSeason}
                onChange={(e) => setFilterSeason(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="all">All Seasons</option>
                {SEASON_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                value={filterStyle}
                onChange={(e) => setFilterStyle(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="all">All Styles</option>
                {STYLE_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List */}
          {loading ? (
            <p>Loading outfits...</p>
          ) : filtered.length === 0 ? (
            <p>No outfits found.</p>
          ) : (
            <div className="space-y-5">
              {filtered.map((outfit) => (
                <div
                  key={outfit.id}
                  className="border p-4 rounded flex items-center gap-4"
                >
                  <img
                    src={outfit.heroImage}
                    alt={outfit.title}
                    className="w-24 h-24 object-cover rounded border"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold">{outfit.title}</h3>

                    <p className="text-sm text-gray-500">
                      {outfit.occasion} • {outfit.styleType} • {outfit.season}
                    </p>

                    <p className="text-xs text-gray-400">
                      {outfit.products.length} products • Total: $
                      {outfit.totalPrice}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/admin/outfits/${outfit.id}`}
                      className="text-blue-600 text-sm underline"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(outfit.id)}
                      disabled={deletingId === outfit.id}
                      className="text-red-600 text-sm underline disabled:opacity-40"
                    >
                      {deletingId === outfit.id ? "Deleting…" : "Delete"}
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
