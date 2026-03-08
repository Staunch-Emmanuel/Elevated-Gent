"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PagePadding, Container } from "@/components/layout";
import { getAllUsers, deleteUser, UserRecord } from "@/lib/firebase/users";

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getAllUsers();
      setUsers(data);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(uid: string) {
    if (!confirm("Delete this user?")) return;

    await deleteUser(uid);
    setUsers((prev) => prev.filter((u) => u.uid !== uid));
  }

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <PagePadding>
          <Container>
            <p>Loading users...</p>
          </Container>
        </PagePadding>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <PagePadding>
        <Container className="py-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Users</h1>
            <Link
              href="/admin/users/new"
              className="bg-black text-white px-4 py-2 rounded"
            >
              + New User
            </Link>
          </div>

          <div className="overflow-x-auto border rounded-lg bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-left text-sm font-medium">Email</th>
                  <th className="p-3 text-left text-sm font-medium">Role</th>
                  <th className="p-3 text-left text-sm font-medium">
                    Subscription
                  </th>
                  <th className="p-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.uid} className="border-b last:border-b-0">
                    <td className="p-3 text-sm">{user.email}</td>
                    <td className="p-3 text-sm">{user.role}</td>
                    <td className="p-3 text-sm">{user.subscriptionStatus}</td>
                    <td className="p-3 text-right space-x-3">
                      <Link
                        href={`/admin/users/${user.uid}`}
                        className="text-blue-600 text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(user.uid)}
                        className="text-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  );
}