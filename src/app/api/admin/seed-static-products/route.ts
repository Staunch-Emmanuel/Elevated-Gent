// src/app/api/admin/seed-static-products/route.ts
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { weeklyProducts, outfitLooks } from '@/lib/products/data'

type SeedResult = {
  weekly: {
    created: number
    skipped: number
    updated: number
    errors: Array<{ id: string; error: string }>
  }
  outfits: {
    created: number
    skipped: number
    updated: number
    errors: Array<{ id: string; error: string }>
  }
}

function getServerTimestamp() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firestoreAny = adminDb as any
  return firestoreAny.constructor.FieldValue.serverTimestamp()
}

export async function POST(req: Request) {
  const secret = req.headers.get('x-seed-secret')
  if (!process.env.SEED_ADMIN_SECRET || secret !== process.env.SEED_ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const dryRun = url.searchParams.get('dryRun') === 'true'
  const force = url.searchParams.get('force') === 'true'

  const result: SeedResult = {
    weekly: { created: 0, skipped: 0, updated: 0, errors: [] },
    outfits: { created: 0, skipped: 0, updated: 0, errors: [] },
  }

  const db = adminDb
  const now = getServerTimestamp()

  // Collection names MUST match what your app already reads from
  const weeklyCol = db.collection('weekly')
  const outfitsCol = db.collection('outfits')

  // -------------------------
  // Seed Weekly Finds
  // -------------------------
  for (const item of weeklyProducts) {
    const id = String(item.id)

    try {
      const ref = weeklyCol.doc(id)

      if (!force) {
        const existing = await ref.get()
        if (existing.exists) {
          result.weekly.skipped += 1
          continue
        }
      }

      if (!dryRun) {
        await ref.set(
          {
            ...item,
            source: 'seed',
            migratedFromStatic: true,
            createdAt: now,
            updatedAt: now,
          },
          { merge: force }
        )
      }

      if (force) result.weekly.updated += 1
      else result.weekly.created += 1
    } catch (e: any) {
      result.weekly.errors.push({ id, error: e?.message || 'Unknown error' })
    }
  }

  // -------------------------
  // Seed Outfit Inspiration
  // -------------------------
  for (const outfit of outfitLooks) {
    const id = String(outfit.id)

    try {
      const ref = outfitsCol.doc(id)

      if (!force) {
        const existing = await ref.get()
        if (existing.exists) {
          result.outfits.skipped += 1
          continue
        }
      }

      if (!dryRun) {
        await ref.set(
          {
            ...outfit,
            source: 'seed',
            migratedFromStatic: true,
            createdAt: now,
            updatedAt: now,
          },
          { merge: force }
        )
      }

      if (force) result.outfits.updated += 1
      else result.outfits.created += 1
    } catch (e: any) {
      result.outfits.errors.push({ id, error: e?.message || 'Unknown error' })
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    force,
    result,
  })
}