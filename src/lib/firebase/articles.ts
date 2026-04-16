import { db } from '@/lib/firebase/config'
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'

import type { ArticleDocument, ArticleStatus } from '@/lib/types/articles'

const COLLECTION = 'articles'

function slugify(value: string): string {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeSlug(value: string | undefined): string {
  return String(value ?? '').trim().toLowerCase()
}

function normalizeCategory(value: unknown): string {
  return String(value ?? '').trim().toLowerCase() || 'general'
}

function normalizeStatus(
  status: unknown,
  published: unknown = true
): ArticleStatus {
  if (status === 'draft' || status === 'published') {
    return status
  }

  if (typeof published === 'boolean') {
    return published ? 'published' : 'draft'
  }

  return 'published'
}

function toIsoDate(value: unknown, fallback: string): string {
  if (!value) return fallback

  if (typeof value === 'string') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? fallback : date.toISOString()
  }

  if (typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? fallback : date.toISOString()
  }

  if (typeof (value as { toDate?: () => Date })?.toDate === 'function') {
    const date = (value as { toDate: () => Date }).toDate()
    return Number.isNaN(date.getTime()) ? fallback : date.toISOString()
  }

  return fallback
}

function mapDocToArticle(id: string, data: any): ArticleDocument {
  const fallbackNow = new Date().toISOString()
  const createdAt = toIsoDate(data.createdAt, fallbackNow)
  const updatedAt = toIsoDate(data.updatedAt, createdAt)
  const publishDate = toIsoDate(
    data.publishDate ?? data.datePublished ?? createdAt,
    createdAt
  )
  const status = normalizeStatus(data.status, data.published)

  return {
    id,
    slug: normalizeSlug(data.slug || slugify(data.title || id)),
    title: data.title ?? '',
    excerpt: data.excerpt ?? '',
    content: data.content ?? '',
    heroImage: data.heroImage ?? '',
    category: normalizeCategory(data.category),
    tag: data.tag ?? '',
    datePublished: toIsoDate(data.datePublished ?? publishDate, publishDate),
    publishDate,
    createdAt,
    updatedAt,
    occasion: data.occasion ?? 'daily',
    status,
    published: status === 'published',
  }
}

export async function getAllArticlesCMS(): Promise<ArticleDocument[]> {
  const snap = await getDocs(collection(db, COLLECTION))
  return snap.docs.map((d) => mapDocToArticle(d.id, d.data()))
}

export async function getPublishedArticlesCMS(): Promise<ArticleDocument[]> {
  const all = await getAllArticlesCMS()
  return all.filter((item) => item.status === 'published')
}

export async function getArticleById(
  id: string
): Promise<ArticleDocument | null> {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) return null
  return mapDocToArticle(snap.id, snap.data())
}

export async function getArticleBySlugCMS(
  slug: string
): Promise<ArticleDocument | null> {
  const target = normalizeSlug(slug)
  const snap = await getDocs(collection(db, COLLECTION))

  for (const d of snap.docs) {
    const article = mapDocToArticle(d.id, d.data())

    if (
      normalizeSlug(article.slug) === target &&
      article.status === 'published'
    ) {
      return article
    }
  }

  return null
}

export async function createArticle(
  data: Partial<ArticleDocument>
): Promise<string> {
  const now = new Date().toISOString()
  const title = String(data.title ?? '').trim()
  const status = normalizeStatus(data.status, data.published)

  const payload = {
    slug: normalizeSlug(data.slug || slugify(title)),
    title,
    excerpt: String(data.excerpt ?? ''),
    content: String(data.content ?? ''),
    heroImage: String(data.heroImage ?? ''),
    category: normalizeCategory(data.category),
    tag: String(data.tag ?? ''),
    datePublished: toIsoDate(data.datePublished ?? now, now),
    publishDate: toIsoDate(data.publishDate ?? data.datePublished ?? now, now),
    createdAt: now,
    updatedAt: now,
    occasion: data.occasion ?? 'daily',
    status,
    published: status === 'published',
  }

  const ref = await addDoc(collection(db, COLLECTION), payload)
  return ref.id
}

export async function updateArticle(
  id: string,
  data: Partial<ArticleDocument>
): Promise<void> {
  const payload: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  }

  if (data.title !== undefined) {
    payload.title = String(data.title).trim()
  }

  if (data.slug !== undefined || data.title !== undefined) {
    const sourceSlug =
      data.slug !== undefined ? String(data.slug) : slugify(String(data.title ?? ''))
    payload.slug = normalizeSlug(sourceSlug)
  }

  if (data.excerpt !== undefined) payload.excerpt = String(data.excerpt)
  if (data.content !== undefined) payload.content = String(data.content)
  if (data.heroImage !== undefined) payload.heroImage = String(data.heroImage)
  if (data.category !== undefined) {
    payload.category = normalizeCategory(data.category)
  }
  if (data.tag !== undefined) payload.tag = String(data.tag)
  if (data.datePublished !== undefined) {
    payload.datePublished = toIsoDate(data.datePublished, new Date().toISOString())
  }
  if (data.publishDate !== undefined) {
    payload.publishDate = toIsoDate(data.publishDate, new Date().toISOString())
  }
  if (data.occasion !== undefined) payload.occasion = data.occasion

  if (data.status !== undefined || data.published !== undefined) {
    const status = normalizeStatus(data.status, data.published)
    payload.status = status
    payload.published = status === 'published'
  }

  await updateDoc(doc(db, COLLECTION, id), payload)
}

export async function deleteArticle(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}