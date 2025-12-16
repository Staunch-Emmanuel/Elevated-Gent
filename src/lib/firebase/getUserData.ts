import { db } from "./firestore";
import { doc, getDoc } from "firebase/firestore";

export async function getUserData(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return {
      role: "user",
      subscriptionStatus: "inactive",
    };
  }

  return {
    role: snap.data().role ?? "user",
    subscriptionStatus: snap.data().subscriptionStatus ?? "inactive",
  };
}
