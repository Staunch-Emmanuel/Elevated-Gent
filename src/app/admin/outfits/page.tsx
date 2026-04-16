'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'

import { deleteOutfit, getAllOutfits } from '@/lib/firebase/outfits'
import { getContentCategories } from '@/lib/firebase/contentCategories'

import type { OutfitDocument } from '@/lib/firebase/outfits'
import type { ProductCategory } from '@/lib/products/types'

export default function AdminOutfitsPage() {
  const [outfits, setOutfits] = useState<OutfitDocument[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  useEffect(() => {
    async function load() {
      setLoading(true)

      try {
        const [docs, categoryDocs] = await Promise.all([
          getAllOutfits(),
          getContentCategories('outfits'),
        ])
        setOutfits(docs)
        setCategories(categoryDocs)
      } catch (err) {
        console.error('Error loading outfits:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this outfit?')) return

    try {
      setDeletingId(id)
      await deleteOutfit(id)
      setOutfits((prev) => prev.filter((o) => o.id !== id))
    } catch (err) {
      console.error(err)
      alert('Failed to delete outfit.')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = useMemo(() => {
    return outfits.filter((item) => {
      const searchValue = search.trim().toLowerCase()

      const matchSearch =
        item.title.toLowerCase().includes(searchValue) ||
        item.description.toLowerCase().includes(searchValue) ||
        item.category.toLowerCase().includes(searchValue)

      const matchCategory =
        filterCategory === 'all' || item.category === filterCategory

      return matchSearch && matchCategory
    })
  }, [outfits, search, filterCategory])

  return (
    <ProtectedRoute requireAdmin>
      <PagePadding>
        <Container className="py-12 max-w-5xl">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl font-bold">Outfits (Admin)</h1>

            <div className="flex gap-3">
              <Link
                href="/admin/categories?section=outfits"
                className="border border-gray-300 px-4 py-2 rounded text-sm"
              >
                Manage Categories
              </Link>

              <Link
                href="/admin/outfits/new"
                className="bg-black text-white px-4 py-2 rounded text-sm"
              >
                + New Outfit
              </Link>
            </div>
          </div>

          <div className="space-y-4 mb-10">
            <input
              placeholder="Search outfits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded w-full"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>

              <div className="border rounded px-3 py-2 text-sm text-gray-500 flex items-center">
                {filtered.length} {filtered.length === 1 ? 'outfit' : 'outfits'}
              </div>
            </div>
          </div>

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
                    src={outfit.heroImage || '/images/placeholder-outfit.jpg'}
                    alt={outfit.title}
                    className="w-24 h-24 object-cover rounded border"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold">{outfit.title}</h3>

                    <p className="text-sm text-gray-500">
                      {outfit.category || 'Uncategorized'}
                    </p>

                    {outfit.description ? (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {outfit.description}
                      </p>
                    ) : null}

                    <div className="mt-2 flex gap-2 flex-wrap">
                      <span className="text-xs text-gray-400">
                        {outfit.productLinks.length} links
                      </span>

                      {outfit.published === false ? (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Draft
                        </span>
                      ) : (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Published
                        </span>
                      )}
                    </div>
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
                      {deletingId === outfit.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}