'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useChat } from '@/context/chat-context';
import Sidebar from './sidebar';
import ChatPanel from './chat-panel';
import NewChatDialog from './new-chat-dialog';

export default function ChatShell() {
  const { user } = useAuth();
  const {
    threads,
    activeId,
    activeThread,
    messages,
    hasOlder,
    online,
    isTyping,
    connected,
    loadingThreads,
    error,
    clearError,
    selectThread,
    openWithUser,
    sendMessage,
    notifyTyping,
    stopTyping,
    loadOlder,
  } = useChat();

  const [dialogOpen, setDialogOpen] = useState(false);

  const partnerId = activeThread?.partner?.id;
  const partnerOnline = partnerId ? online.includes(partnerId) : false;
  const existingIds = threads.map((thread) => thread.partner?.id).filter(Boolean);

  // Below the breakpoint only one pane is on screen at a time, the same way the
  // prototype swaps the list for the thread.
  const showSidebar = !activeId;

  return (
    <div className="relative z-[2] flex h-full w-full max-w-[1280px] animate-pop overflow-hidden rounded-[26px] bg-window shadow-window transition-colors duration-500 max-[900px]:max-w-none max-[900px]:rounded-none max-[900px]:shadow-none md:max-h-[900px]">
      <Sidebar
        threads={threads}
        activeId={activeId}
        onlineIds={online}
        loading={loadingThreads}
        onSelect={selectThread}
        onAddContact={() => setDialogOpen(true)}
        className={showSidebar ? 'flex w-full flex-1' : 'hidden md:flex'}
      />

      <ChatPanel
        thread={activeThread}
        messages={messages}
        meId={user?.id}
        online={partnerOnline}
        typing={isTyping}
        hasOlder={hasOlder}
        onLoadOlder={() => loadOlder(activeId)}
        onSend={sendMessage}
        onTyping={notifyTyping}
        onStopTyping={stopTyping}
        onBack={() => selectThread(null)}
        className={showSidebar ? 'hidden md:flex' : 'flex'}
      />

      <NewChatDialog
        open={dialogOpen}
        existingIds={existingIds}
        onlineIds={online}
        onPick={openWithUser}
        onClose={() => setDialogOpen(false)}
      />

      {!connected && (
        <p className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-window px-4 py-1.5 text-[11.5px] font-semibold text-muted shadow-menu">
          Reconnecting
        </p>
      )}

      {error && (
        <button
          type="button"
          onClick={clearError}
          className="absolute bottom-4 right-4 z-30 rounded-xl bg-danger px-4 py-2 text-[12.5px] font-semibold text-white shadow-menu"
        >
          {error}
        </button>
      )}
    </div>
  );
}
