'use client'

import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'

import { db } from '@/lib/firebase/config'
import type { Product } from '@/lib/products/types'

const COLLECTION = 'weekly'

export type WeeklyItem = Product & {
  id: string
  createdAt?: any
  updatedAt?: any
  published?: boolean
}

function mapWeeklyDoc(id: string, data: any): WeeklyItem {
  return {
    ...(data as Product),
    id,
    published: typeof data?.published === 'boolean' ? data.published : true,
    createdAt: data?.createdAt,
    updatedAt: data?.updatedAt,
  }
}

export async function getAllWeekly(): Promise<WeeklyItem[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)

  return snap.docs.map((d) => mapWeeklyDoc(d.id, d.data()))
}

export async function getWeeklyProducts(): Promise<Product[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)

  return snap.docs
    .map((d) => mapWeeklyDoc(d.id, d.data()))
    .filter((item) => item.published !== false)
    .map(({ createdAt, updatedAt, ...rest }) => rest as Product)
}

export async function getWeeklyById(id: string): Promise<WeeklyItem | null> {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) return null

  return mapWeeklyDoc(snap.id, snap.data())
}

export async function getWeeklyProductById(id: string): Promise<Product | null> {
  const item = await getWeeklyById(id)
  if (!item) return null
  const { createdAt, updatedAt, ...rest } = item as any
  return rest as Product
}

export async function createWeeklyProduct(input: Product): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    published: typeof input.published === 'boolean' ? input.published : true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function createWeekly(input: Product): Promise<string> {
  return createWeeklyProduct(input)
}

export async function updateWeeklyProduct(
  id: string,
  data: Partial<Product>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function updateWeekly(
  id: string,
  data: Partial<Product>
): Promise<void> {
  return updateWeeklyProduct(id, data)
}

export async function deleteWeeklyProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}

export async function deleteWeekly(id: string): Promise<void> {
  return deleteWeeklyProduct(id)
}