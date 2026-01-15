import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export async function linkStripeSubscriptionToUser(uid: string) {
  if (typeof window === "undefined") return;

  const sessionId = localStorage.getItem("eg_checkout_session_id");
  if (!sessionId) return;

  const sessionRef = doc(db, "stripeCheckoutSessions", sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) {
    console.warn("Stripe session not found:", sessionId);
    return;
  }

  const sessionData = sessionSnap.data();

  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    subscriptionStatus: "active",
    stripeCustomerId: sessionData.stripeCustomerId,
    stripeSubscriptionId: sessionData.stripeSubscriptionId,
    subscriptionLinkedAt: new Date(),
  });

  // Cleanup
  localStorage.removeItem("eg_checkout_session_id");
  await deleteDoc(sessionRef);
}
