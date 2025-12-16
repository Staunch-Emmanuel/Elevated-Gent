"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserById, updateUser } from "@/lib/firebase/users";

export default function EditTestUserPage() {
  const router = useRouter();
  const { id } = useParams();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getUserById(id as string);
      setUser(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  async function handleSubmit(e: any) {
    e.preventDefault();
    setSaving(true);

    await updateUser(id as string, {
      email: user.email,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
    });

    router.push("/admin/test-users");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Test User</h1>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block font-semibold mb-2">User ID (UID)</label>
          <input
            className="w-full border p-3 rounded bg-gray-100 text-gray-600"
            value={user.id}
            readOnly
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Email</label>
          <input
            className="w-full border p-3 rounded"
            value={user.email}
            onChange={(e) =>
              setUser({ ...user, email: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Role</label>
          <select
            className="w-full border p-3 rounded"
            value={user.role}
            onChange={(e) =>
              setUser({ ...user, role: e.target.value })
            }
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
            <option value="tester">tester</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2">Subscription Status</label>
          <select
            className="w-full border p-3 rounded"
            value={user.subscriptionStatus}
            onChange={(e) =>
              setUser({ ...user, subscriptionStatus: e.target.value })
            }
          >
            <option value="active">active</option>
            <option value="blocked">blocked</option>
            <option value="trial">trial</option>
            <option value="expired">expired</option>
          </select>
        </div>

        <button
          disabled={saving}
          type="submit"
          className="bg-black text-white px-6 py-3 rounded"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
