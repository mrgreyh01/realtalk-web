'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import AuthCard from '@/components/auth/auth-card';
import AmbientBackground from '@/components/ui/ambient-background';

export default function LoginPage() {
  const router = useRouter();
  const { user, restoring } = useAuth();

  useEffect(() => {
    if (!restoring && user) {
      router.replace('/chat');
    }
  }, [user, restoring, router]);

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-x-hidden bg-app px-4 py-8 max-[900px]:p-0">
      <AmbientBackground />
      <div className="relative z-[2] m-auto flex w-full max-w-[1000px] items-center justify-center">
        <AuthCard />
      </div>
    </main>
  );
}
