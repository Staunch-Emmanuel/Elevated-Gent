import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

const COLLECTION = 'siteSettings'
const AUTH_MEDIA_DOC_ID = 'authMedia'

function normalizeTimestamp(value: any): string | undefined {
  if (!value) return undefined

  if (typeof value === 'string') return value

  if (typeof value?.toDate === 'function') {
    return value.toDate().toISOString()
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  return undefined
}

function mapDocToAuthMedia(data: any) {
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

function getDefaultAuthMedia() {
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

async function verifyAdminFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim()

    if (token) {
      try {
        const decoded = await adminAuth.verifyIdToken(token)
        const userSnap = await adminDb.collection('users').doc(decoded.uid).get()

        if (!userSnap.exists) {
          return { ok: false as const, status: 403 }
        }

        const user = userSnap.data() as any
        if (user?.role !== 'admin') {
          return { ok: false as const, status: 403 }
        }

        return { ok: true as const, uid: decoded.uid }
      } catch {
        return { ok: false as const, status: 401 }
      }
    }
  }

  const cookieStore = await cookies()
  const session = cookieStore.get('__session')

  if (!session?.value) {
    return { ok: false as const, status: 401 }
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(session.value, true)
    const userSnap = await adminDb.collection('users').doc(decoded.uid).get()

    if (!userSnap.exists) {
      return { ok: false as const, status: 403 }
    }

    const user = userSnap.data() as any
    if (user?.role !== 'admin') {
      return { ok: false as const, status: 403 }
    }

    return { ok: true as const, uid: decoded.uid }
  } catch {
    return { ok: false as const, status: 401 }
  }
}

export async function GET() {
  try {
    const directDoc = await adminDb.collection(COLLECTION).doc(AUTH_MEDIA_DOC_ID).get()

    if (directDoc.exists) {
      return NextResponse.json(mapDocToAuthMedia(directDoc.data()))
    }

    const fallbackSnap = await adminDb.collection(COLLECTION).limit(1).get()

    if (!fallbackSnap.empty) {
      return NextResponse.json(mapDocToAuthMedia(fallbackSnap.docs[0].data()))
    }

    return NextResponse.json(getDefaultAuthMedia())
  } catch (error) {
    console.error('Failed to load auth media settings:', error)
    return NextResponse.json(getDefaultAuthMedia(), { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  const authResult = await verifyAdminFromRequest(request)

  if (!authResult.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: authResult.status })
  }

  try {
    const body = await request.json()

    const payload = {
      videoUrl: String(body?.videoUrl || '').trim(),
      posterImageUrl: String(body?.posterImageUrl || '').trim(),
      mobileVideoUrl: String(body?.mobileVideoUrl || '').trim(),
      enabled: typeof body?.enabled === 'boolean' ? body.enabled : false,
      autoplay: typeof body?.autoplay === 'boolean' ? body.autoplay : true,
      muted: typeof body?.muted === 'boolean' ? body.muted : true,
      loop: typeof body?.loop === 'boolean' ? body.loop : true,
      headline: String(body?.headline || '').trim(),
      subheadline: String(body?.subheadline || '').trim(),
      updatedAt: new Date(),
    }

    const ref = adminDb.collection(COLLECTION).doc(AUTH_MEDIA_DOC_ID)
    const existing = await ref.get()

    await ref.set(
      existing.exists
        ? payload
        : {
            ...payload,
            createdAt: new Date(),
          },
      { merge: true }
    )

    const saved = await ref.get()

    return NextResponse.json({
      success: true,
      data: saved.exists ? mapDocToAuthMedia(saved.data()) : getDefaultAuthMedia(),
    })
  } catch (error) {
    console.error('Failed to save auth media settings:', error)
    return NextResponse.json(
      { error: 'Failed to save auth media settings.' },
      { status: 500 }
    )
  }
}