'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import { PagePadding, Container } from '@/components/layout'

import {
  getAllWeekly,
  deleteWeekly,
  type WeeklyItem,
} from '@/lib/firebase/weekly'
import { getContentCategories } from '@/lib/firebase/contentCategories'
import type { ProductCategory } from '@/lib/products/types'

export default function WeeklyAdminPage() {
  const [items, setItems] = useState<WeeklyItem[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  async function load() {
    setLoading(true)
    try {
      const [cms, categoryDocs] = await Promise.all([
        getAllWeekly(),
        getContentCategories('weekly'),
      ])
      setItems(cms)
      setCategories(categoryDocs)
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
    } catch {
      alert('Failed to delete item.')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = search.toLowerCase().trim()

      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)

      const matchesCategory =
        categoryFilter === 'all' ||
        item.category.toLowerCase() === categoryFilter.toLowerCase()

      return matchesSearch && matchesCategory
    })
  }, [items, search, categoryFilter])

  return (
    <PagePadding>
      <Container className="py-10 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Weekly Products (Admin)</h1>

          <div className="flex gap-3">
            <Link
              href="/admin/categories?section=weekly"
              className="px-4 py-2 border border-gray-300 rounded text-sm"
            >
              Manage Categories
            </Link>

            <Link
              href="/admin/weekly/new"
              className="px-4 py-2 bg-black text-white rounded text-sm"
            >
              + Add Weekly Item
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <input
            className="border p-2 rounded flex-1 min-w-[200px]"
            placeholder="Search by title, brand, or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border p-2 rounded min-w-[220px]"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
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
                key={item.id}
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

                    <div className="mt-2 flex gap-2 flex-wrap">
                      <span className="text-xs bg-green-200 px-2 py-1 rounded">
                        CMS
                      </span>

                      {item.published === false ? (
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
                </div>

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
              </div>
            ))}
          </div>
        )}
      </Container>
    </PagePadding>
  )
}