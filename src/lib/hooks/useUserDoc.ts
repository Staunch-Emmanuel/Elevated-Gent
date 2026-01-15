'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/auth';

export function useUserDoc() {
  const { user } = useAuth();
  const [userDoc, setUserDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserDoc(null);
      setLoading(false);
      return;
    }

    const fetchDoc = async () => {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      setUserDoc(snap.exists() ? snap.data() : null);
      setLoading(false);
    };

    fetchDoc();
  }, [user]);

  return { userDoc, loading };
}
