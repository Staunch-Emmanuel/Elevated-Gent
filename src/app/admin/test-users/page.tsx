// src/app/admin/test-users/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PagePadding, Container } from "@/components/layout";

import {
  getAllUsers,
  createUser,
  deleteUser,
  type UserRecord,
  type UserRole,
  type SubscriptionStatus,
} from "@/lib/firebase/users";

export default function AdminTestUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [error, setError] = useState<string>("");

  // quick-create form
  const [email, setEmail] = useState("");
  const [uid, setUid] = useState("");
  const [role, setRole] = useState<UserRole>("subscriber" as UserRole);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(
    "trialing" as SubscriptionStatus
  );
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const all = await getAllUsers();
        setUsers(all);
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Failed to load users.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [users]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      const cleanEmail = email.trim();
      if (!cleanEmail) {
        setError("Email is required.");
        setCreating(false);
        return;
      }

      const cleanUid = uid.trim() || crypto.randomUUID();

      // ✅ IMPORTANT: createUser expects (uid, data)
      await createUser(cleanUid, {
        email: cleanEmail,
        role,
        subscriptionStatus,
      });

      // refresh list
      const all = await getAllUsers();
      setUsers(all);

      // reset
      setEmail("");
      setUid("");
      setRole("subscriber" as UserRole);
      setSubscriptionStatus("trialing" as SubscriptionStatus);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to create user.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this user record?")) return;

    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Failed to delete user.");
    }
  }

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Test Users</h1>
            <Link
              href="/admin/test-users/new"
              className="px-4 py-2 rounded-md bg-black text-white text-sm"
            >
              New Test User
            </Link>
          </div>

          {error ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="border rounded-lg p-4 mb-8">
            <h2 className="font-semibold mb-3">Quick Create</h2>

            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="test@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">UID (optional)</label>
                <input
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="auto-generate"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Role</label>
                <select
                  value={role as unknown as string}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="subscriber">Subscriber</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1">
                  Subscription Status
                </label>
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

              <div className="md:col-span-2 flex items-end">
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full md:w-auto px-4 py-2 rounded-md bg-black text-white text-sm disabled:opacity-60"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>

          {loading ? <p>Loading...</p> : null}

          {!loading && (
            <div className="space-y-3">
              {sortedUsers.map((u) => (
                <div
                  key={u.id}
                  className="border rounded-lg px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{u.email ?? "No email"}</p>
                    <p className="text-xs text-gray-500 truncate">
                      ID: {u.id} • Role: {u.role ?? "subscriber"} • Status:{" "}
                      {u.subscriptionStatus ?? "inactive"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/test-users/${u.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-sm text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {sortedUsers.length === 0 && (
                <p className="text-sm text-gray-500">No users yet.</p>
              )}
            </div>
          )}
        </Container>
      </PagePadding>
    </ProtectedRoute>
  );
}
