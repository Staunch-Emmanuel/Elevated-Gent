"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "@/lib/firebase/firebase";
import { getUserData } from "@/lib/firebase/firestore";

export default function AdminCMS() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const profile = await getUserData(currentUser.uid);

        // ⛔ If not admin → redirect away
        if (profile.role !== "admin") {
          window.location.href = "/";
          return;
        }

        loadData();
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function loadData() {
    const querySnapshot = await getDocs(collection(db, "weekly_products"));
    setItems(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  }

  async function handleAdd() {
    if (!title.trim()) return;
    await addDoc(collection(db, "weekly_products"), {
      title: title.trim(),
      createdAt: Date.now(),
    });
    setTitle("");
    loadData();
  }

  async function handleDelete(id: string) {
    await deleteDoc(doc(db, "weekly_products", id));
    loadData();
  }

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  if (!user) return null; // Should not happen due to auth redirect

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">CMS Dashboard (Admin)</h1>
        <button onClick={() => signOut(auth)} className="text-sm text-gray-500 hover:text-black">
          Sign Out
        </button>
      </div>

      <div className="mb-8">
        <label className="block text-gray-700 font-medium mb-2">Add Weekly Product</label>
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter product name..."
            className="flex-1 border border-gray-300 rounded px-3 py-2"
          />
          <button onClick={handleAdd} className="px-4 py-2 bg-black text-white rounded">
            Add
          </button>
        </div>
      </div>

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between items-center border rounded px-4 py-2">
            {item.title}
            <button onClick={() => handleDelete(item.id)} className="text-red-500 text-sm">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
