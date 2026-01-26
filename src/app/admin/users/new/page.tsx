// src/app/admin/users/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PagePadding, Container } from "@/components/layout";

import {
  createUser,
  type UserRecord,
  type UserRole,
  type SubscriptionStatus,
} from "@/lib/firebase/users";

export default function NewUserPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [user, setUser] = useState<Partial<UserRecord>>({
    email: "",
    role: "subscriber" as UserRole,
    subscriptionStatus: "inactive" as SubscriptionStatus,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const email = (user.email ?? "").trim();
      if (!email) {
        setError("Email is required.");
        setSaving(false);
        return;
      }

      // ✅ createUser needs a UID + data
      const uid = crypto.randomUUID();

      await createUser(uid, {
        email,
        role: (user.role ?? "subscriber") as UserRole,
        subscriptionStatus: (user.subscriptionStatus ?? "inactive") as SubscriptionStatus,
      });

      router.push("/admin/users");
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Failed to create user.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container className="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">New User</h1>
            <button
              type="button"
              onClick={() => router.push("/admin/users")}
              className="text-sm underline"
            >
              Back
            </button>
          </div>

          {error ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4">
            <div>
              <label className="block text-xs font-medium mb-1">Email</label>
              <input
                value={user.email ?? ""}
                onChange={(e) => setUser((p) => ({ ...p, email: e.target.value }))}
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Role</label>
              <select
                value={(user.role ?? "subscriber") as unknown as string}
                onChange={(e) => setUser((p) => ({ ...p, role: e.target.value as UserRole }))}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="subscriber">Subscriber</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Subscription Status</label>
              <select
                value={(user.subscriptionStatus ?? "inactive") as unknown as string}
                onChange={(e) =>
                  setUser((p) => ({ ...p, subscriptionStatus: e.target.value as SubscriptionStatus }))
                }
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="trialing">Trialing</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-black text-white text-sm disabled:opacity-60"
            >
              {saving ? "Saving..." : "Create User"}
            </button>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  );
}
