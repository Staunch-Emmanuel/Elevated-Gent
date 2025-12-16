"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Dashboard", href: "/admin" },
  { name: "Articles", href: "/admin/articles" },
  { name: "Weekly Finds", href: "/admin/weekly" },
  { name: "Wellness", href: "/admin/wellness" },
  { name: "Outfits", href: "/admin/outfits" },
  { name: "Users", href: "/admin/users" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-black text-white min-h-screen py-10 px-6 border-r border-gray-800">
      <h1 className="text-2xl font-serif font-semibold mb-10">
        Admin Panel
      </h1>

      <nav className="space-y-3">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`block px-3 py-2 rounded-lg font-serif text-sm transition-all
                ${active ? "bg-white text-black font-semibold" : "text-gray-300 hover:text-white hover:bg-gray-800"}
              `}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
