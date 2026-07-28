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
      <Container className="max-w-5xl py-10 md:py-12">
        <div className="mb-8 flex flex-col gap-5 border border-[#817E6C] bg-[#E8EBEC] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.07)] sm:p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#625e53]">
              Product Management
            </p>

            <h1 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[#24231d]">
              Weekly Products
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/categories?section=weekly"
              className="border border-[#817E6C] bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#817E6C] transition-colors hover:bg-[#817E6C] hover:text-[#E8EBEC]"
            >
              Manage Categories
            </Link>

            <Link
              href="/admin/weekly/new"
              className="border border-[#817E6C] bg-[#817E6C] px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#E8EBEC] transition-colors hover:bg-transparent hover:text-[#817E6C]"
            >
              + Add Weekly Item
            </Link>
          </div>
        </div>

        <div className="mb-8 grid gap-4 border border-[#817E6C] bg-[#E8EBEC] p-5 shadow-[0_12px_32px_rgba(36,35,29,0.05)] md:grid-cols-[minmax(0,1fr)_240px]">
          <input
            className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
            placeholder="Search by title, brand, or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none hover:border-[#817E6C] focus:border-[#817E6C]"
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
          <div className="border border-[#817E6C] bg-[#E8EBEC] px-6 py-12 text-center shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
            <p className="font-serif text-[#575348]">Loading…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-[#817E6C] bg-[#E8EBEC] px-6 py-12 text-center shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
            <p className="font-serif text-[#575348]">
              No weekly items found.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-5 border border-[#817E6C] bg-[#E8EBEC] p-5 shadow-[0_10px_28px_rgba(36,35,29,0.05)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-44 w-full border border-[#817E6C] object-cover sm:h-24 sm:w-24"
                  />

                  <div className="min-w-0">
                    <h3 className="font-editorial text-2xl font-normal leading-tight text-[#24231d]">
                      {item.title}
                    </h3>

                    <p className="mt-2 font-serif text-sm text-[#575348]">
                      {item.brand} • {item.category}
                    </p>

                    <p className="mt-1 font-serif text-sm font-semibold text-[#817E6C]">
                      {item.price}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="border border-[#9aaa83] bg-[#edf3e4] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#40512f]">
                        CMS
                      </span>

                      {item.published === false ? (
                        <span className="border border-[#b89b63] bg-[#f4ead2] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6c5428]">
                          Draft
                        </span>
                      ) : (
                        <span className="border border-[#9aaa83] bg-[#edf3e4] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#40512f]">
                          Published
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 sm:justify-end">
                  <Link
                    href={`/admin/weekly/${item.id}`}
                    className="border border-[#817E6C] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#817E6C] transition-colors hover:bg-[#817E6C] hover:text-[#E8EBEC]"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="border border-[#a65a50] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#913a32] transition-colors hover:bg-[#913a32] hover:text-[#E8EBEC] disabled:cursor-not-allowed disabled:opacity-40"
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