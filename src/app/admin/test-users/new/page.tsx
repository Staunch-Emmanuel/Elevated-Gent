"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createTestUser } from "@/lib/firebase/users";

export default function NewTestUserPage() {
  const router = useRouter();

  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [subscriptionStatus, setSubscriptionStatus] = useState("active");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setSaving(true);

    await createTestUser({
      uid,
      email,
      role,
      subscriptionStatus,
    });

    router.push("/admin/test-users");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">New Test User</h1>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block font-semibold mb-2">User ID (UID)</label>
          <input
            className="w-full border p-3 rounded"
            required
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            placeholder="Paste Firebase UID here"
          />
          <p className="text-xs text-gray-500 mt-1">
            You can copy this from Firebase &gt; Authentication &gt; Users.
          </p>
        </div>

        <div>
          <label className="block font-semibold mb-2">Email</label>
          <input
            className="w-full border p-3 rounded"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Role</label>
          <select
            className="w-full border p-3 rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
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
            value={subscriptionStatus}
            onChange={(e) => setSubscriptionStatus(e.target.value)}
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
          {saving ? "Saving..." : "Create Test User"}
        </button>
      </form>
    </div>
  );
}
