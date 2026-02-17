'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import LoadingScreen from '@/app/components/LoadingScreenFixed';

export default function SettingsPage() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/chat');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return <LoadingScreen />;
}
