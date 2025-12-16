"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/firebase/users";

export default function NewUserPage() {
  const router = useRouter();

  const [user, setUser] = useState({
    email: "",
    role: "user",
    subscriptionStatus: "inactive",
  });

  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setSaving(true);

    await createUser({
      email: user.email,
      role: user.role as any,
      subscriptionStatus: user.subscriptionStatus as any,
    });

    router.push("/admin/users");
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create User</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          className="w-full border p-3"
          placeholder="User Email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />

        <div>
          <label className="block mb-2 font-medium">Role</label>
          <select
            className="w-full border p-3"
            value={user.role}
            onChange={(e) => setUser({ ...user, role: e.target.value })}
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
              setUser({ ...user, subscriptionStatus: e.target.value })
            }
          >
            <option value="inactive">Inactive</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <button type="submit" disabled={saving} className="bg-black text-white px-4 py-2 rounded">
          {saving ? "Saving..." : "Create User"}
        </button>
      </form>
    </div>
  );
}
