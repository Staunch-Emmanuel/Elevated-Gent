"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserById, updateUser, UserRecord } from "@/lib/firebase/users";

export default function EditUserPage() {
  const params = useParams();
  const id = params.id as string;

  const router = useRouter();

  const [user, setUser] = useState<UserRecord | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getUserById(id);
      if (!data) return;
      setUser(data);
    }
    load();
  }, [id]);

  async function handleSave(e: any) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    await updateUser(id, {
      email: user.email,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
    });

    router.push("/admin/users");
  }

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit User</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <input
          className="w-full border p-3"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />

        <div>
          <label className="block mb-2 font-medium">Role</label>
          <select
            className="w-full border p-3"
            value={user.role}
            onChange={(e) => setUser({ ...user, role: e.target.value as any })}
          >
            <option value="user">User</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Subscription</label>
          <select
            className="w-full border p-3"
            value={user.subscriptionStatus}
            onChange={(e) =>
              setUser({
                ...user,
                subscriptionStatus: e.target.value as any,
              })
            }
          >
            <option value="inactive">Inactive</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <button type="submit" disabled={saving} className="bg-black text-white px-4 py-2 rounded">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
