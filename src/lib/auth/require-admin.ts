import { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

function getBearerToken(request: NextRequest): string {
  const authorization = request.headers.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization token");
  }

  return authorization.slice("Bearer ".length).trim();
}

export async function requireAdmin(request: NextRequest) {
  const token = getBearerToken(request);
  const decodedToken = await adminAuth.verifyIdToken(token);

  const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();

  if (!userDoc.exists) {
    throw new Error("User profile not found");
  }

  const userData = userDoc.data() as { role?: string } | undefined;

  if (userData?.role !== "admin") {
    throw new Error("Admin access required");
  }

  return {
    uid: decodedToken.uid,
    email: decodedToken.email ?? "",
  };
}