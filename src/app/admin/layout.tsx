"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminGuard from "@/components/auth/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        {/* LEFT SIDEBAR */}
        <AdminSidebar />

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 p-10 bg-gray-50 min-h-screen">
          {children}
        </div>
      </div>
    </AdminGuard>
  );
}
