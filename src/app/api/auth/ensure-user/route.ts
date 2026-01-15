import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : "";

    if (!token) {
      return NextResponse.json(
        { error: "Missing bearer token" },
        { status: 401 }
      );
    }

    const decoded = await adminAuth.verifyIdToken(token);

    const uid = decoded.uid;
    const email = decoded.email || null;
    const name =
      (decoded.name as string | undefined) ||
      "";

    const ref = adminDb.collection("users").doc(uid);
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set(
        {
          uid,
          email,
          displayName: name,
          role: "user",
          subscriptionStatus: "inactive",
          createdAt: new Date(),
        },
        { merge: true }
      );
    } else {
      // Ensure required fields always exist
      await ref.set(
        {
          uid,
          email,
        },
        { merge: true }
      );
    }

    return NextResponse.json({ ok: true, uid });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err?.message || "Failed to ensure user document",
      },
      { status: 500 }
    );
  }
}
