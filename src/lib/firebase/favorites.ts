'use client'

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { db } from '@/lib/firebase/config'

export type FavoriteContentType = 'weekly' | 'outfit'

export interface FavoriteItem {
  id: string
  contentId: string
  type: FavoriteContentType
  title: string
  imageUrl: string
  category?: string
  brand?: string
  price?: string
  description?: string
  href?: string
  externalUrl?: string
  createdAt?: any
}

export interface SaveFavoriteInput {
  userId: string
  contentId: string
  type: FavoriteContentType
  title: string
  imageUrl: string
  category?: string
  brand?: string
  price?: string
  description?: string
  href?: string
  externalUrl?: string
}

function getFavoriteDocId(type: FavoriteContentType, contentId: string): string {
  return `${type}_${contentId}`
}

function sanitizeText(value: unknown): string {
  return String(value ?? '').trim()
}

function sanitizeOptionalText(value: unknown): string | undefined {
  const text = sanitizeText(value)
  return text || undefined
}

export async function getUserFavorites(userId: string): Promise<FavoriteItem[]> {
  if (!userId) return []

  const favoritesRef = collection(db, 'users', userId, 'favorites')

  const snap = await getDocs(query(favoritesRef, orderBy('createdAt', 'desc')))

  return snap.docs.map((item) => {
    const data = item.data()

    return {
      id: item.id,
      contentId: sanitizeText(data.contentId),
      type: data.type === 'outfit' ? 'outfit' : 'weekly',
      title: sanitizeText(data.title),
      imageUrl: sanitizeText(data.imageUrl),
      category: sanitizeOptionalText(data.category),
      brand: sanitizeOptionalText(data.brand),
      price: sanitizeOptionalText(data.price),
      description: sanitizeOptionalText(data.description),
      href: sanitizeOptionalText(data.href),
      externalUrl: sanitizeOptionalText(data.externalUrl),
      createdAt: data.createdAt,
    }
  })
}

export async function saveFavorite(input: SaveFavoriteInput): Promise<void> {
  const userId = sanitizeText(input.userId)
  const contentId = sanitizeText(input.contentId)
  const title = sanitizeText(input.title)

  if (!userId) {
    throw new Error('User is required to save favorites.')
  }

  if (!contentId) {
    throw new Error('Content ID is required to save favorites.')
  }

  if (!title) {
    throw new Error('Title is required to save favorites.')
  }

  const favoriteId = getFavoriteDocId(input.type, contentId)
  const favoriteRef = doc(db, 'users', userId, 'favorites', favoriteId)

  await setDoc(
    favoriteRef,
    {
      contentId,
      type: input.type,
      title,
      imageUrl: sanitizeText(input.imageUrl),
      category: sanitizeText(input.category),
      brand: sanitizeText(input.brand),
      price: sanitizeText(input.price),
      description: sanitizeText(input.description),
      href: sanitizeText(input.href),
      externalUrl: sanitizeText(input.externalUrl),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function removeFavorite(
  userId: string,
  type: FavoriteContentType,
  contentId: string
): Promise<void> {
  const cleanUserId = sanitizeText(userId)
  const cleanContentId = sanitizeText(contentId)

  if (!cleanUserId || !cleanContentId) return

  const favoriteId = getFavoriteDocId(type, cleanContentId)
  await deleteDoc(doc(db, 'users', cleanUserId, 'favorites', favoriteId))
}

export async function toggleFavorite(input: SaveFavoriteInput & {
  isFavorited: boolean
}): Promise<boolean> {
  if (input.isFavorited) {
    await removeFavorite(input.userId, input.type, input.contentId)
    return false
  }

  await saveFavorite(input)
  return true
}