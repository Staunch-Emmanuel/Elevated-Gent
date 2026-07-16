'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminTopbar from '@/components/admin/AdminTopbar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requireAdmin>
      <div className="flex min-h-screen bg-[#f8f1e5] text-[#24231d]">
        <AdminSidebar />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f8f1e5] text-[#24231d]">
          <AdminTopbar />

          <main className="flex-1 bg-[#f8f1e5] text-[#24231d]">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}