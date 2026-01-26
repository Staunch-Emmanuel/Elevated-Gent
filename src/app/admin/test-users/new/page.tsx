// src/app/admin/test-users/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PagePadding, Container } from "@/components/layout";

import {
  createUser,
  type UserRole,
  type SubscriptionStatus,
} from "@/lib/firebase/users";

export default function NewTestUserPage() {
  const router = useRouter();

  const [uid, setUid] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [role, setRole] = useState<UserRole>("subscriber" as UserRole);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(
    "trialing" as SubscriptionStatus
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleanUid = uid.trim() || crypto.randomUUID();
      const cleanEmail = email.trim();

      if (!cleanEmail) {
        setError("Email is required.");
        setLoading(false);
        return;
      }

      // ✅ IMPORTANT: createUser expects (uid, data)
      await createUser(cleanUid, {
        email: cleanEmail,
        role,
        subscriptionStatus,
      });

      router.push("/admin/test-users");
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Failed to create test user.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container className="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Create Test User</h1>
            <button
              type="button"
              onClick={() => router.push("/admin/test-users")}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">UID (optional)</label>
              <input
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                placeholder="Leave blank to auto-generate"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                If you leave this blank, a UID will be generated automatically.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={role as unknown as string}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="subscriber">Subscriber</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Subscription Status</label>
              <select
                value={subscriptionStatus as unknown as string}
                onChange={(e) =>
                  setSubscriptionStatus(e.target.value as SubscriptionStatus)
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
              disabled={loading}
              className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Test User"}
            </button>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  );
}
