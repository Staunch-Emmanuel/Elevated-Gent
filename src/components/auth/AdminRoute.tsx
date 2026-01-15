'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth';
import { useUserDoc } from '@/lib/hooks/useUserDoc';

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { userDoc, loading: docLoading } = useUserDoc();

  const loading = authLoading || docLoading;

  useEffect(() => {
    if (loading) return;

    // Not logged in
    if (!user) {
      router.replace('/auth/signin');
      return;
    }

    // Logged in but not subscribed
    if (userDoc?.subscriptionStatus !== 'active') {
      router.replace('/subscribe');
      return;
    }

    // Logged in, subscribed, but not admin
    if (userDoc?.role !== 'admin') {
      router.replace('/account');
      return;
    }
  }, [user, userDoc, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading…</p>
      </div>
    );
  }

  if (
    !user ||
    userDoc?.subscriptionStatus !== 'active' ||
    userDoc?.role !== 'admin'
  ) {
    return null;
  }

  return <>{children}</>;
}
