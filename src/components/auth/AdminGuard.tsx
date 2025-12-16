'use client';

import { useAuth } from '@/lib/firebase/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [checkingRole, setCheckingRole] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (loading) return;

    // User not logged in → redirect
    if (!user) {
      router.replace('/auth/signin');
      return;
    }

    const userId = user.uid; // ⭐ FIX: TS now knows it's never null

    async function checkRole() {
      try {
        const ref = doc(db, 'users', userId);
        const snap = await getDoc(ref);

        if (snap.exists() && snap.data().role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Role check failed:', err);
        setIsAdmin(false);
      }

      setCheckingRole(false);
    }

    checkRole();
  }, [user, loading, router]);

  if (loading || checkingRole) {
    return (
      <div className="flex items-center justify-center h-screen">
        Checking permissions...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600 text-lg">Access Denied</p>
      </div>
    );
  }

  return <>{children}</>;
}
