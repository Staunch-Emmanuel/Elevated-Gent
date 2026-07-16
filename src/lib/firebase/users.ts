// src/lib/firebase/users.ts
import { db } from "@/lib/firebase/config";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
} from "firebase/firestore";

/**
 * IMPORTANT:
 * These unions must match the values used across admin + app UI.
 * Your admin screens currently use:
 * - role: "subscriber"
 * - subscriptionStatus: "trialing", "active", and "inactive"
 */

export type UserRole = "admin" | "subscriber";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "inactive"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused"
  | "none";

export type UserRecord = {
  id: string;
  uid: string;

  email?: string;
  name?: string;

  role?: UserRole;

  subscriptionStatus?: SubscriptionStatus;
  isSubscribed?: boolean;

  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  priceId?: string;
  currentPeriodEnd?: string;

  createdAt?: string;
  updatedAt?: string;

  [key: string]: any;
};

const COLLECTION = "users";

function mapDocToUser(id: string, data: any): UserRecord {
  return {
    ...data,
    id,
    uid: id,
    email: data?.email,
    name: data?.name,
    role: data?.role,
    subscriptionStatus: data?.subscriptionStatus ?? data?.subscription_status,
    isSubscribed: data?.isSubscribed ?? data?.subscribed ?? false,
    stripeCustomerId: data?.stripeCustomerId,
    stripeSubscriptionId: data?.stripeSubscriptionId,
    priceId: data?.priceId,
    currentPeriodEnd: data?.currentPeriodEnd,
    createdAt: data?.createdAt,
    updatedAt: data?.updatedAt,
  };
}

// LIST ALL USERS
export async function getAllUsers(): Promise<UserRecord[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => mapDocToUser(d.id, d.data()));
}

// GET BY ID
export async function getUserById(id: string): Promise<UserRecord | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return mapDocToUser(snap.id, snap.data());
}

// GET BY EMAIL
export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const q = query(
    collection(db, COLLECTION),
    where("email", "==", email),
    limit(1)
  );

  const snap = await getDocs(q);

  if (snap.empty) return null;

  const d = snap.docs[0];

  return mapDocToUser(d.id, d.data());
}

// CREATE / UPSERT (usually for real users where doc id = auth uid)
export async function createUser(
  id: string,
  data: Partial<UserRecord>
): Promise<void> {
  const now = new Date().toISOString();

  // Put data first, then set timestamps so they don't get overwritten.
  const payload: Partial<UserRecord> = {
    ...data,
    createdAt: data.createdAt ?? now,
    updatedAt: now,
  };

  await setDoc(doc(db, COLLECTION, id), payload, { merge: true });
}

// CREATE TEST USER (Firestore-only record)
export async function createTestUser(
  data: Partial<UserRecord> & { email: string }
): Promise<string> {
  const now = new Date().toISOString();

  /**
   * Fix: avoid "email specified more than once"
   * - Spread first
   * - Then set email once at the end
   */
  const payload: Partial<UserRecord> = {
    ...data,
    role: (data.role ?? "subscriber") as UserRole,
    subscriptionStatus: (data.subscriptionStatus ??
      "trialing") as SubscriptionStatus,
    isSubscribed: data.isSubscribed ?? false,
    createdAt: data.createdAt ?? now,
    updatedAt: now,
    email: data.email,
  };

  const ref = await addDoc(collection(db, COLLECTION), payload);

  return ref.id;
}

// UPDATE BY ID
export async function updateUserById(
  id: string,
  data: Partial<UserRecord>
): Promise<void> {
  const now = new Date().toISOString();

  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: now,
  });
}

/**
 * Alias for admin pages that import `updateUser`
 */
export const updateUser = updateUserById;

// DELETE
export async function deleteUser(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}