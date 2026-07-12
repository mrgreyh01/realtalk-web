'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import AmbientBackground from '@/components/ui/ambient-background';

export default function IndexPage() {
  const router = useRouter();
  const { user, restoring } = useAuth();

  useEffect(() => {
    if (restoring) {
      return;
    }
    router.replace(user ? '/chat' : '/login');
  }, [user, restoring, router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app">
      <AmbientBackground />
      <p className="relative z-[2] text-sm font-semibold text-muted">Loading RealTalk</p>
    </main>
  );
}
