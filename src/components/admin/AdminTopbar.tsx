"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const publicLinks = [
  { label: "Home", href: "/home" },
  { label: "Personal-styling", href: "/personal-styling" },
  { label: "Articles", href: "/articles" },
  { label: "Weekly Finds", href: "/weekly" },
  { label: "Outfit Inspiration", href: "/outfit-inspiration" },
  { label: "Wellness", href: "/wellness" },
  { label: "Account", href: "/account" },
];

export default function AdminTopbar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === href;
    return pathname === href || pathname?.startsWith(`${href}/`);
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
            Elevated Gent Admin
          </p>
          <h1 className="text-lg font-semibold text-black">
            Manage content and jump back to the live site
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {publicLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? "bg-black text-white"
                    : "border border-gray-300 bg-white text-black hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}