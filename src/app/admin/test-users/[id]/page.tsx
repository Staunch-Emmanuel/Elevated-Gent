// src/app/admin/test-users/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PagePadding, Container } from "@/components/layout";

import { getUserById, updateUserById } from "@/lib/firebase/users";

type UserRole = "admin" | "subscriber";
type SubscriptionStatus = "active" | "inactive" | "trialing" | "canceled" | "past_due";

type UserRecord = {
  id: string;
  email?: string;
  role?: UserRole;
  subscriptionStatus?: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt?: any;
  updatedAt?: any;
};

export default function EditTestUserPage() {
  const router = useRouter();
  const params = useParams();

  const userId = useMemo(() => {
    const raw = (params as any)?.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [user, setUser] = useState<UserRecord | null>(null);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("subscriber");
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus>("inactive");
  const [stripeCustomerId, setStripeCustomerId] = useState("");
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState("");

  useEffect(() => {
    async function load() {
      if (!userId) return;

      setLoading(true);
      setError("");

      try {
        const doc = (await getUserById(String(userId))) as any;

        if (!doc) {
          setUser(null);
          setError("User not found.");
          setLoading(false);
          return;
        }

        setUser(doc);

        setEmail(doc.email ?? "");
        setRole((doc.role as UserRole) ?? "subscriber");
        setSubscriptionStatus(
          (doc.subscriptionStatus as SubscriptionStatus) ?? "inactive"
        );
        setStripeCustomerId(doc.stripeCustomerId ?? "");
        setStripeSubscriptionId(doc.stripeSubscriptionId ?? "");
      } catch (e) {
        console.error(e);
        setError("Failed to load user.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setError("");

    try {
      await updateUserById(String(userId), {
        email,
        role,
        subscriptionStatus,
        stripeCustomerId,
        stripeSubscriptionId,
      });

      router.push("/admin/test-users");
    } catch (e) {
      console.error(e);
      setError("Failed to update user.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <PagePadding>
          <Container>
            <p>Loading...</p>
          </Container>
        </PagePadding>
      </ProtectedRoute>
    );
  }

  if (!user) {
    return (
      <ProtectedRoute>
        <PagePadding>
          <Container>
            <p className="text-sm text-gray-600">User not found.</p>
            {error && (
              <p className="mt-3 text-sm text-red-600 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}
          </Container>
        </PagePadding>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container className="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Edit Test User</h1>
            <button
              onClick={() => router.push("/admin/test-users")}
              className="px-3 py-1.5 rounded-md border text-xs"
            >
              Back
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 border border-red-200 rounded-md px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value="subscriber">Subscriber</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Subscription Status
                </label>
                <select
                  value={subscriptionStatus}
                  onChange={(e) =>
                    setSubscriptionStatus(e.target.value as SubscriptionStatus)
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value="inactive">Inactive</option>
                  <option value="active">Active</option>
                  <option value="trialing">Trialing</option>
                  <option value="canceled">Canceled</option>
                  <option value="past_due">Past Due</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Stripe Customer ID
              </label>
              <input
                value={stripeCustomerId}
                onChange={(e) => setStripeCustomerId(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Stripe Subscription ID
              </label>
              <input
                value={stripeSubscriptionId}
                onChange={(e) => setStripeSubscriptionId(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-black text-white text-sm disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  );
}
