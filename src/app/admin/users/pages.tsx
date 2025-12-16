"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

  async function handleDelete(id: string) {
    if (!confirm("Delete this user?")) return;

    await deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Users</h1>
        <Link href="/admin/users/new" className="bg-black text-white px-4 py-2 rounded">
          + New User
        </Link>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Subscription</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="p-3">{u.email}</td>
              <td className="p-3 capitalize">{u.role}</td>
              <td className="p-3 capitalize">{u.subscriptionStatus}</td>

              <td className="p-3 text-right space-x-3">
                <Link href={`/admin/users/${u.id}`} className="text-blue-600">
                  Edit
                </Link>
                <button onClick={() => handleDelete(u.id)} className="text-red-600">
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
