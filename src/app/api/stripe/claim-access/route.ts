import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : null;

    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    await adminDb.collection("users").doc(uid).set(
      {
        subscriptionStatus: "active",
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Claim access error:", err);
    return new Response("Server error", { status: 500 });
  }
}
