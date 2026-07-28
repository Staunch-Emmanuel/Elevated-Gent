'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import AdminGuard from '@/components/auth/AdminGuard'

export default function AdminCMS() {
  const [title, setTitle] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const snap = await getDocs(collection(db, 'weekly_products'))
    setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  async function handleAdd() {
    if (!title.trim()) return

    await addDoc(collection(db, 'weekly_products'), {
      title: title.trim(),
      createdAt: Date.now(),
    })

    setTitle('')
    loadData()
  }

  return (
    <AdminGuard>
      <div className="min-h-full bg-[#e8ebec] px-6 py-10 text-[#24231d] sm:px-8 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="border border-[#817e6c] bg-[#e8ebec] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.07)] sm:p-8">
            <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#625e53]">
              Content Management
            </p>

            <h1 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[#24231d]">
              Admin CMS
            </h1>
          </div>

          <div className="border border-[#817e6c] bg-[#e8ebec] p-6 shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
            <div className="flex flex-col gap-4 sm:flex-row">
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="min-h-12 w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 transition-colors hover:border-[#817e6c] focus:border-[#817e6c]"
                placeholder="New item"
              />

              <button
                onClick={handleAdd}
                className="shrink-0 border border-[#817e6c] bg-[#817e6c] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#e8ebec] transition-colors hover:bg-transparent hover:text-[#817e6c]"
              >
                Add
              </button>
            </div>
          </div>

          {loading ? (
            <div className="border border-[#817e6c] bg-[#e8ebec] px-6 py-12 text-center shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
              <p className="font-serif text-[#575348]">Loading…</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map(i => (
                <li
                  key={i.id}
                  className="border border-[#817e6c] bg-[#e8ebec] px-5 py-4 font-serif text-base text-[#24231d] shadow-[0_8px_24px_rgba(36,35,29,0.04)]"
                >
                  {i.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminGuard>
  )
}