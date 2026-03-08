import { loadEnvConfig } from "@next/env"

loadEnvConfig(process.cwd())

type SeedSummary = {
  collection: "weekly" | "outfits"
  totalStaticItems: number
  missingSlug: string[]
  duplicateSlugsInStatic: string[]
  existingInFirestore: string[]
  createdInFirestore: string[]
  skippedBecauseExists: string[]
}

const WRITE_MODE = process.argv.includes("--write")

function getObjectValue(item: object, key: string) {
  return (item as Record<string, unknown>)[key]
}

function getStringValue(item: object, key: string) {
  const value = getObjectValue(item, key)
  return typeof value === "string" ? value : ""
}

function getLabel(item: object) {
  return (
    getStringValue(item, "slug") ||
    getStringValue(item, "title") ||
    getStringValue(item, "name") ||
    "untitled-item"
  )
}

function normalizeItem(item: object) {
  const record = item as Record<string, unknown>
  const now = new Date().toISOString()

  return {
    ...record,
    createdAt:
      typeof record.createdAt === "string" && record.createdAt
        ? record.createdAt
        : now,
    updatedAt: now,
  }
}

function findDuplicateSlugs(items: object[]) {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  for (const item of items) {
    const slug = getStringValue(item, "slug").trim()
    if (!slug) continue

    if (seen.has(slug)) {
      duplicates.add(slug)
    } else {
      seen.add(slug)
    }
  }

  return Array.from(duplicates)
}

async function seedCollection(
  adminDb: FirebaseFirestore.Firestore,
  collectionName: "weekly" | "outfits",
  items: object[]
): Promise<SeedSummary> {
  const summary: SeedSummary = {
    collection: collectionName,
    totalStaticItems: items.length,
    missingSlug: [],
    duplicateSlugsInStatic: findDuplicateSlugs(items),
    existingInFirestore: [],
    createdInFirestore: [],
    skippedBecauseExists: [],
  }

  if (summary.duplicateSlugsInStatic.length > 0) {
    return summary
  }

  for (const rawItem of items) {
    const slug = getStringValue(rawItem, "slug").trim()

    if (!slug) {
      summary.missingSlug.push(getLabel(rawItem))
      continue
    }

    const existingSnapshot = await adminDb
      .collection(collectionName)
      .where("slug", "==", slug)
      .limit(1)
      .get()

    if (!existingSnapshot.empty) {
      summary.existingInFirestore.push(slug)
      summary.skippedBecauseExists.push(slug)
      continue
    }

    if (WRITE_MODE) {
      const payload = normalizeItem(rawItem)
      await adminDb.collection(collectionName).add(payload)
      summary.createdInFirestore.push(slug)
    }
  }

  return summary
}

function printSummary(summary: SeedSummary) {
  console.log("")
  console.log(`Collection: ${summary.collection}`)
  console.log(`Static items: ${summary.totalStaticItems}`)
  console.log(`Missing slug: ${summary.missingSlug.length}`)
  console.log(`Duplicate slugs in static data: ${summary.duplicateSlugsInStatic.length}`)
  console.log(`Already in Firestore: ${summary.existingInFirestore.length}`)
  console.log(`Created in Firestore: ${summary.createdInFirestore.length}`)
  console.log(`Skipped because already exists: ${summary.skippedBecauseExists.length}`)

  if (summary.missingSlug.length > 0) {
    console.log("Items missing slug:")
    for (const item of summary.missingSlug) {
      console.log(`- ${item}`)
    }
  }

  if (summary.duplicateSlugsInStatic.length > 0) {
    console.log("Duplicate slugs found in static data:")
    for (const slug of summary.duplicateSlugsInStatic) {
      console.log(`- ${slug}`)
    }
  }
}

async function verifyCollectionCount(
  adminDb: FirebaseFirestore.Firestore,
  collectionName: "weekly" | "outfits"
) {
  const snapshot = await adminDb.collection(collectionName).get()
  return snapshot.size
}

async function run() {
  console.log("")
  console.log("====================================")
  console.log("The Elevated Gentleman product seeder")
  console.log("Mode:", WRITE_MODE ? "WRITE" : "DRY RUN")
  console.log("====================================")

  console.log("")
  console.log("Firebase Admin env check")
  console.log("FIREBASE_ADMIN_PROJECT_ID:", process.env.FIREBASE_ADMIN_PROJECT_ID ? "present" : "missing")
  console.log("FIREBASE_ADMIN_CLIENT_EMAIL:", process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? "present" : "missing")
  console.log("FIREBASE_ADMIN_PRIVATE_KEY:", process.env.FIREBASE_ADMIN_PRIVATE_KEY ? "present" : "missing")

  const [{ weeklyProducts, outfitLooks }, { adminDb }] = await Promise.all([
    import("../lib/products/data"),
    import("../lib/firebase/admin"),
  ])

  const weeklySummary = await seedCollection("adminDb" in { adminDb } ? adminDb : adminDb, "weekly", weeklyProducts as object[])
  const outfitsSummary = await seedCollection("adminDb" in { adminDb } ? adminDb : adminDb, "outfits", outfitLooks as object[])

  printSummary(weeklySummary)
  printSummary(outfitsSummary)

  if (
    weeklySummary.duplicateSlugsInStatic.length > 0 ||
    outfitsSummary.duplicateSlugsInStatic.length > 0
  ) {
    console.log("")
    console.log("Seeding stopped because duplicate slugs were found in static data.")
    process.exit(1)
  }

  if (
    weeklySummary.missingSlug.length > 0 ||
    outfitsSummary.missingSlug.length > 0
  ) {
    console.log("")
    console.log("Seeding stopped because some items are missing slug values.")
    process.exit(1)
  }

  if (WRITE_MODE) {
    const weeklyCount = await verifyCollectionCount(adminDb, "weekly")
    const outfitsCount = await verifyCollectionCount(adminDb, "outfits")

    console.log("")
    console.log("Final Firestore counts")
    console.log(`weekly: ${weeklyCount}`)
    console.log(`outfits: ${outfitsCount}`)
  } else {
    console.log("")
    console.log("Dry run completed. No Firestore documents were written.")
    console.log("Run again with --write to create missing documents.")
  }

  console.log("")
  console.log("Done.")
}

run().catch((error) => {
  console.error("")
  console.error("Seeder failed.")
  console.error(error)
  process.exit(1)
})