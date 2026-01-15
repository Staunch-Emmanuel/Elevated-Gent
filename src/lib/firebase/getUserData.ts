import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export type UserRole = "user" | "admin";
export type SubscriptionStatus = "active" | "inactive";

export interface UserData {
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
}

export async function getUserData(uid: string): Promise<UserData> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return {
      role: "user",
      subscriptionStatus: "inactive",
    };
  }

  const data = snap.data();

  return {
    role: data.role === "admin" ? "admin" : "user",
    subscriptionStatus:
      data.subscriptionStatus === "active" ? "active" : "inactive",
  };
}
