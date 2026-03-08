"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import { getUserData } from "@/lib/firebase/getUserData";

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireSubscription = false,
}: {
  children: ReactNode;
  requireAdmin?: boolean;
  requireSubscription?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      if (loading) return;

      if (!user) {
        router.replace(`/auth/signin?next=${pathname}`);
        return;
      }

      try {
        const data = await getUserData(user.uid);

        if (!mounted) return;

        if (requireAdmin && data.role !== "admin") {
          router.replace("/");
          return;
        }

        if (
          requireSubscription &&
          data.role !== "admin" &&
          data.subscriptionStatus !== "active"
        ) {
          router.replace("/subscribe");
          return;
        }

        setAllowed(true);
      } catch (error) {
        console.error("ProtectedRoute access check failed:", error);
        router.replace("/");
      }
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [user, loading, requireAdmin, requireSubscription, router, pathname]);

  if (!allowed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-gray-500">Checking access…</p>
      </div>
    );
  }

  return <>{children}</>;
}