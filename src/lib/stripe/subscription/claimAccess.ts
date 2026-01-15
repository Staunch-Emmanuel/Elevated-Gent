import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export async function claimAccess(uid: string) {
  if (!uid) throw new Error("Missing UID");

  await updateDoc(doc(db, "users", uid), {
    subscriptionStatus: "active",
    subscriptionLinkedAt: new Date(),
  });
}
