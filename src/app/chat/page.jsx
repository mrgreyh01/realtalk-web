'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { ChatProvider } from '@/context/chat-context';
import ChatShell from '@/components/chat/chat-shell';
import AmbientBackground from '@/components/ui/ambient-background';

export default function ChatPage() {
  const router = useRouter();
  const { user, restoring } = useAuth();

  useEffect(() => {
    if (!restoring && !user) {
      router.replace('/login');
    }
  }, [user, restoring, router]);

  return (
    <main className="screen-inset relative flex h-[100dvh] items-center justify-center overflow-hidden bg-app">
      <AmbientBackground />

      {user ? (
        <ChatProvider>
          <ChatShell />
        </ChatProvider>
      ) : (
        <p className="relative z-[2] text-sm font-semibold text-muted">
          {restoring ? 'Restoring your session' : 'Redirecting to sign in'}
        </p>
      )}
    </main>
  );
}
