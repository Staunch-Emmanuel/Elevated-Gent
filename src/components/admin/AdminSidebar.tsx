"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const path = usePathname();

  const menu = [
    { label: "Dashboard", href: "/admin" },
    { label: "Articles", href: "/admin/articles" },
    { label: "Weekly", href: "/admin/weekly" },
    { label: "Wellness", href: "/admin/wellness" },
    { label: "Outfits", href: "/admin/outfits" },
    { label: "Users", href: "/admin/users" },
  ];

  return (
    <aside className="w-64 bg-black text-white p-6 space-y-6">
      <h2 className="text-2xl font-bold">CMS</h2>

      <nav className="space-y-2">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-2 rounded hover:bg-gray-800 ${
              path.startsWith(item.href) ? "bg-gray-700" : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
