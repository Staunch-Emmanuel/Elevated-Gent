"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { label: "Dashboard", href: "/admin" },
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
    <aside className="w-64 bg-black text-white min-h-screen p-6 border-r border-gray-900">
      <h2 className="text-2xl font-bold mb-8">Admin Dashboard</h2>

      <nav className="space-y-2">
        {menu.map((item) => {
          const active = path === item.href || path.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded transition ${
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