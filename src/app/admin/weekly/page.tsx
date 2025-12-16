'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'

import { weeklyProducts as staticWeeklyProducts } from '@/lib/products/data'
import type { Product } from '@/lib/products/types'

import {
  getAllWeekly,
  deleteWeekly,
  type WeeklyItem,
} from '@/lib/firebase/weekly'

type CombinedWeekly = (WeeklyItem | Product) & {
  source: 'cms' | 'static'
}

export default function WeeklyAdminPage() {
  const [items, setItems] = useState<CombinedWeekly[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  async function load() {
    setLoading(true)
    try {
      const cms = await getAllWeekly()
      const cmsMapped: CombinedWeekly[] = cms.map((item) => ({
        ...item,
        source: 'cms' as const,
      }))

      const staticMapped: CombinedWeekly[] = staticWeeklyProducts.map(
        (item) => ({
          ...item,
          source: 'static' as const,
        }),
      )

      // CMS first, then static (keep static order)
      const merged = [...cmsMapped, ...staticMapped]

      setItems(merged)
    } catch (err) {
      console.error('Error loading weekly:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this weekly item?')) return
    setDeletingId(id)
    try {
      await deleteWeekly(id)
      await load()
    } catch (err) {
      console.error('Error deleting weekly item:', err)
      alert('Failed to delete item.')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = items.filter((item) => {
    const q = search.toLowerCase()

    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)

    const matchesCategory =
      categoryFilter === 'all' ||
      item.category.toLowerCase() === categoryFilter.toLowerCase()

    return matchesSearch && matchesCategory
  })

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container className="py-10 max-w-5xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold">Weekly Products (Admin)</h1>

            <Link
              href="/admin/weekly/new"
              className="px-4 py-2 bg-black text-white rounded text-sm"
            >
              + Add Weekly Item
            </Link>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-wrap gap-4 mb-8">
            <input
              className="border p-2 rounded flex-1 min-w-[200px]"
              placeholder="Search by title, brand, or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="border p-2 rounded min-w-[200px]"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Finds of the Week">Finds of the Week</option>
              <option value="Deals of the Week">Deals of the Week</option>
              <option value="Fashion on a Budget">Fashion on a Budget</option>
              <option value="High Roller List">High Roller List</option>
              <option value="Best Accessories">Best Accessories</option>
              <option value="Emerging Brand Spotlight">
                Emerging Brand Spotlight
              </option>
            </select>
          </div>

          {loading ? (
            <p>Loading…</p>
          ) : filtered.length === 0 ? (
            <p>No weekly items found.</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((item) => (
                <div
                  key={item.id + item.source}
                  className="border rounded p-4 flex items-center gap-4 justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded border"
                    />

                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-gray-500">
                        {item.brand} • {item.category}
                      </p>
                      <p className="text-sm text-gray-500">{item.price}</p>

                      <div className="mt-1 flex gap-2">
                        {item.source === 'static' ? (
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                            STATIC (read-only)
                          </span>
                        ) : (
                          <span className="text-xs bg-green-200 px-2 py-1 rounded">
                            CMS
                          </span>
                        )}

                        {item.featured && (
                          <span className="text-xs bg-yellow-100 px-2 py-1 rounded">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <a
                      href={item.productLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 text-sm underline"
                    >
                      View Product
                    </a>

                    {item.source === 'cms' && (
                      <div className="flex gap-3">
                        <Link
                          href={`/admin/weekly/${item.id}`}
                          className="text-yellow-600 text-sm underline"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="text-red-600 text-sm underline disabled:opacity-40"
                        >
                          {deletingId === item.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    )}
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
