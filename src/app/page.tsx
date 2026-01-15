import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export default async function HomePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session");

  if (!session?.value) {
    redirect("/auth/signin");
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(session.value, true);

    const userSnap = await adminDb.collection("users").doc(decoded.uid).get();

    if (!userSnap.exists) {
      redirect("/subscribe");
    }

    const user = userSnap.data() as any;

    if (user?.role === "admin") {
      redirect("/admin");
    }

    if (user?.subscriptionStatus !== "active") {
      redirect("/subscribe");
    }

    redirect("/personal-styling");
  } catch (err) {
    console.error("Home routing error:", err);
    redirect("/auth/signin");
  }
}
