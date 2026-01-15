'use client';

import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../firebase';

/* =======================
   TYPES
======================= */

export type UserRole = 'user' | 'editor' | 'admin';
export type SubscriptionStatus = 'active' | 'inactive' | 'blocked';

export interface UserRecord {
  uid: string;
  email: string;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  createdAt?: any;
  updatedAt?: any;
}

/* =======================
   READ
======================= */

export async function getAllUsers(): Promise<UserRecord[]> {
  const snap = await getDocs(collection(db, 'users'));

  return snap.docs.map((d) => ({
    uid: d.id,
    ...(d.data() as Omit<UserRecord, 'uid'>),
  }));
}

export async function getUserById(uid: string): Promise<UserRecord | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;

  return {
    uid: snap.id,
    ...(snap.data() as Omit<UserRecord, 'uid'>),
  };
}

/* =======================
   CREATE
======================= */

export async function createUser(input: {
  email: string;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
}) {
  const ref = doc(collection(db, 'users'));

  await updateDoc(ref, {
    email: input.email,
    role: input.role,
    subscriptionStatus: input.subscriptionStatus,
    createdAt: serverTimestamp(),
  });
}

/* =======================
   UPDATE
======================= */

export async function updateUser(
  uid: string,
  data: Partial<UserRecord>
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/* =======================
   DELETE
======================= */

export async function deleteUser(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid));
}
