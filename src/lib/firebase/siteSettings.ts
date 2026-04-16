import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { db } from '@/lib/firebase/config'

const COLLECTION = 'siteSettings'
const AUTH_MEDIA_DOC_ID = 'authMedia'

export interface AuthMediaSettings {
  id: string
  videoUrl: string
  posterImageUrl: string
  mobileVideoUrl?: string
  enabled: boolean
  autoplay: boolean
  muted: boolean
  loop: boolean
  headline?: string
  subheadline?: string
  createdAt?: string
  updatedAt?: string
}

function normalizeTimestamp(value: any): string | undefined {
  if (!value) return undefined

  if (typeof value === 'string') return value

  if (typeof value?.toDate === 'function') {
    return value.toDate().toISOString()
  }

  return undefined
}

function mapDocToAuthMedia(data: any): AuthMediaSettings {
  return {
    id: AUTH_MEDIA_DOC_ID,
    videoUrl: typeof data?.videoUrl === 'string' ? data.videoUrl.trim() : '',
    posterImageUrl:
      typeof data?.posterImageUrl === 'string' ? data.posterImageUrl.trim() : '',
    mobileVideoUrl:
      typeof data?.mobileVideoUrl === 'string' ? data.mobileVideoUrl.trim() : '',
    enabled: typeof data?.enabled === 'boolean' ? data.enabled : false,
    autoplay: typeof data?.autoplay === 'boolean' ? data.autoplay : true,
    muted: typeof data?.muted === 'boolean' ? data.muted : true,
    loop: typeof data?.loop === 'boolean' ? data.loop : true,
    headline: typeof data?.headline === 'string' ? data.headline.trim() : '',
    subheadline:
      typeof data?.subheadline === 'string' ? data.subheadline.trim() : '',
    createdAt: normalizeTimestamp(data?.createdAt),
    updatedAt: normalizeTimestamp(data?.updatedAt),
  }
}

export async function getAuthMediaSettings(): Promise<AuthMediaSettings> {
  const directDoc = await getDoc(doc(db, COLLECTION, AUTH_MEDIA_DOC_ID))

  if (directDoc.exists()) {
    return mapDocToAuthMedia(directDoc.data())
  }

  const fallbackSnap = await getDocs(query(collection(db, COLLECTION), limit(1)))
  if (!fallbackSnap.empty) {
    return mapDocToAuthMedia(fallbackSnap.docs[0].data())
  }

  return {
    id: AUTH_MEDIA_DOC_ID,
    videoUrl: '',
    posterImageUrl: '',
    mobileVideoUrl: '',
    enabled: false,
    autoplay: true,
    muted: true,
    loop: true,
    headline: 'ELEVATE YOUR STYLE',
    subheadline: 'Professional styling services for the modern gentleman',
  }
}

export async function saveAuthMediaSettings(
  input: Partial<AuthMediaSettings>
): Promise<void> {
  const payload = {
    videoUrl: String(input.videoUrl || '').trim(),
    posterImageUrl: String(input.posterImageUrl || '').trim(),
    mobileVideoUrl: String(input.mobileVideoUrl || '').trim(),
    enabled: typeof input.enabled === 'boolean' ? input.enabled : false,
    autoplay: typeof input.autoplay === 'boolean' ? input.autoplay : true,
    muted: typeof input.muted === 'boolean' ? input.muted : true,
    loop: typeof input.loop === 'boolean' ? input.loop : true,
    headline: String(input.headline || '').trim(),
    subheadline: String(input.subheadline || '').trim(),
    updatedAt: serverTimestamp(),
  }

  const ref = doc(db, COLLECTION, AUTH_MEDIA_DOC_ID)
  const existing = await getDoc(ref)

  await setDoc(
    ref,
    existing.exists()
      ? payload
      : {
          ...payload,
          createdAt: serverTimestamp(),
        },
    { merge: true }
  )
}