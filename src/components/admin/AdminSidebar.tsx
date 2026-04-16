"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { label: "Dashboard", href: "/admin" },
  { label: "Homepage", href: "/admin/homepage" },
  { label: "Auth Page Media", href: "/admin/auth-media" },
  { label: "Articles", href: "/admin/articles" },
  { label: "Weekly", href: "/admin/weekly" },
  { label: "Wellness", href: "/admin/wellness" },
  { label: "Outfits", href: "/admin/outfits" },
  { label: "Personal Styling", href: "/admin/personal-styling" },
  { label: "Users", href: "/admin/users" },
];

export default function AdminSidebar() {
  const path = usePathname();

  return (
    <aside className="w-64 min-h-screen border-r border-gray-900 bg-black p-6 text-white">
      <h2 className="mb-8 text-2xl font-bold">Admin Dashboard</h2>

      <nav className="space-y-2">
        {menu.map((item) => {
          const active = path === item.href || path.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded px-4 py-2 transition ${
                active ? "bg-gray-700" : "hover:bg-gray-800"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}