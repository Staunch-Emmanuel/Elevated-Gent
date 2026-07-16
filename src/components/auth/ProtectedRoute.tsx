"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import { getUserData } from "@/lib/firebase/getUserData";

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireSubscription = true, // 🔥 DEFAULT TRUE NOW
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

        // 🔒 ADMIN CHECK
        if (requireAdmin && data.role !== "admin") {
          router.replace("/");
          return;
        }

        // 🔒 SUBSCRIPTION CHECK (NOW ALWAYS ACTIVE)
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
        router.replace("/subscribe");
      }
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [user, loading, requireAdmin, requireSubscription, router, pathname]);

  if (!allowed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[var(--color-eg-espresso)] px-6">
        <p className="border border-[var(--color-eg-line-light)] bg-[var(--color-eg-espresso-deep)] px-7 py-5 font-serif text-sm text-[var(--color-eg-cream)] shadow-[0_14px_36px_rgba(24,23,17,0.16)]">
          Checking access…
        </p>
      </div>
    );
  }

  return <>{children}</>;
}