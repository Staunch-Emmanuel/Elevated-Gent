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
      <div className="p-8 space-y-6">
        <h1 className="text-2xl font-semibold">Admin CMS</h1>

        <div className="flex gap-2">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border px-3 py-2"
            placeholder="New item"
          />
          <button onClick={handleAdd} className="border px-4 py-2">
            Add
          </button>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <ul className="list-disc pl-6">
            {items.map(i => (
              <li key={i.id}>{i.title}</li>
            ))}
          </ul>
        )}
      </div>
    </AdminGuard>
  )
}
