"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    articles: 0,
    weekly: 0,
    wellness: 0,
    outfits: 0,
    users: 0,
    loading: true,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const articlesSnap = await getCountFromServer(collection(db, "articles"));
        const weeklySnap = await getCountFromServer(collection(db, "weekly"));
        const wellnessSnap = await getCountFromServer(collection(db, "wellness"));
        const outfitsSnap = await getCountFromServer(collection(db, "outfits"));
        const usersSnap = await getCountFromServer(collection(db, "users"));

        setStats({
          articles: articlesSnap.data().count,
          weekly: weeklySnap.data().count,
          wellness: wellnessSnap.data().count,
          outfits: outfitsSnap.data().count,
          users: usersSnap.data().count,
          loading: false,
        });
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      }
    }

    loadStats();
  }, []);

  if (stats.loading) {
    return (
      <div className="flex justify-center items-center h-64 text-xl">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-10 space-y-12">
      <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Articles" count={stats.articles} href="/admin/articles" />
        <DashboardCard title="Weekly" count={stats.weekly} href="/admin/weekly" />
        <DashboardCard title="Wellness" count={stats.wellness} href="/admin/wellness" />
        <DashboardCard title="Outfits" count={stats.outfits} href="/admin/outfits" />
        <DashboardCard title="Users" count={stats.users} href="/admin/users" />
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  count,
  href,
}: {
  title: string;
  count: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block border rounded-lg p-6 shadow hover:shadow-xl transition"
    >
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-gray-600 mt-2 text-lg">{count} items</p>
      <p className="mt-4 text-blue-600 hover:underline">Manage →</p>
    </Link>
  );
}
