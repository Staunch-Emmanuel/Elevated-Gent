import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "./firestore";

export interface UserRecord {
  id: string;          // Firestore doc ID == Firebase Auth UID when available
  email: string;
  role: "admin" | "editor" | "user";
  subscriptionStatus: "active" | "inactive" | "blocked";
  createdAt: any;
  updatedAt: any;
}

const colRef = collection(db, "users");

// Get all users
export async function getAllUsers(): Promise<UserRecord[]> {
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as UserRecord[];
}

// Get one user
export async function getUserById(id: string): Promise<UserRecord | null> {
  const ref = doc(db, "users", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  } as UserRecord;
}

// Create user manually (test user)
export async function createUser(data: Omit<UserRecord, "id" | "createdAt" | "updatedAt">) {
  const newRef = doc(colRef); // Firestore auto-ID (not Firebase Auth)
  await setDoc(newRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return newRef.id;
}

// Update role / subscription
export async function updateUser(id: string, data: Partial<UserRecord>) {
  const ref = doc(db, "users", id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Delete user
export async function deleteUser(id: string) {
  const ref = doc(db, "users", id);
  await deleteDoc(ref);
}
