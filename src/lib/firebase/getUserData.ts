import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export type UserRole = "subscriber" | "admin";
export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused"
  | "none";

export interface UserData {
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
}

export async function getUserData(uid: string): Promise<UserData> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return {
      role: "subscriber",
      subscriptionStatus: "inactive",
    };
  }

  const data = snap.data();

  return {
    role: data.role === "admin" ? "admin" : "subscriber",
    subscriptionStatus:
      typeof data.subscriptionStatus === "string"
        ? (data.subscriptionStatus as SubscriptionStatus)
        : "inactive",
  };
}