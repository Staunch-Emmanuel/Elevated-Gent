'use client';

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

type TestUser = {
  email: string;
  password: string;
  displayName: string;
};

const TEST_USERS: TestUser[] = [
  {
    email: "john.doe@test.com",
    password: "password123",
    displayName: "John Doe",
  },
  {
    email: "michael.smith@test.com",
    password: "password123",
    displayName: "Michael Smith",
  },
  {
    email: "david.johnson@test.com",
    password: "password123",
    displayName: "David Johnson",
  },
];

async function createTestUsers() {
  for (const user of TEST_USERS) {
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );

      await updateProfile(cred.user, {
        displayName: user.displayName,
      });

      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email: user.email,
        displayName: user.displayName,
        role: "user",
        subscriptionStatus: "inactive",
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      if (err.code !== "auth/email-already-in-use") {
        throw err;
      }
    }
  }
}

export default function CreateTestUsersPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Create Test Users</h1>
      <button
        onClick={createTestUsers}
        style={{
          marginTop: 16,
          padding: "8px 16px",
          background: "black",
          color: "white",
        }}
      >
        Create Users
      </button>
    </div>
  );
}
