"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAdmin>
      <div className="flex min-h-screen bg-white text-black">
        <AdminSidebar />
        <div className="flex min-h-screen flex-1 flex-col bg-white text-black">
          <AdminTopbar />
          <main className="flex-1 bg-white text-black">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}