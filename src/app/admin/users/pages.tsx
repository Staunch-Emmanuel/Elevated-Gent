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

  async function handleDelete(uid: string) {
    if (!confirm("Delete this user?")) return;

    await deleteUser(uid);
    setUsers((prev) => prev.filter((u) => u.uid !== uid));
  }

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users</h1>
        <Link
          href="/admin/users/new"
          className="bg-black text-white px-4 py-2 rounded"
        >
          + New User
        </Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Subscription</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.uid} className="border-b">
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.role}</td>
              <td className="p-2">{user.subscriptionStatus}</td>
              <td className="p-2 text-right space-x-3">
                <Link
                  href={`/admin/users/${user.uid}`}
                  className="text-blue-600"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(user.uid)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
