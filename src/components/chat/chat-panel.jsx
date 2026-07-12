'use client';

import Avatar from '@/components/ui/avatar';
import { ArrowLeftIcon, BubbleIcon } from '@/components/ui/icons';
import { handleOf } from '@/lib/format';
import MessageList from './message-list';
import Composer from './composer';

function EmptyState() {
  return (
    <div className="flex flex-1 animate-fade flex-col items-center justify-center px-10 text-center">
      <div className="mb-[26px] flex h-[120px] w-[120px] animate-float items-center justify-center rounded-full bg-accentsoft text-accent">
        <BubbleIcon />
      </div>
      <h2 className="mb-2 font-display text-[19px] font-semibold text-ink">
        Select or add a person to chat
      </h2>
      <p className="max-w-[280px] text-sm leading-relaxed text-muted">
        Pick a conversation from the left, or tap <b className="text-accent">+</b> to start a new one.
      </p>
    </div>
  );
}

function Header({ partner, online, typing, onBack }) {
  const status = typing ? 'typing' : online ? 'Online' : 'Offline';

  return (
    <div className="flex items-center gap-3 border-b border-line bg-window px-6 py-4 transition-colors duration-500">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to conversations"
        className="mr-0.5 flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-field text-muted md:hidden"
      >
        <ArrowLeftIcon />
      </button>

      <Avatar user={partner} presence={null} />

      <div className="min-w-0 flex-1">
        <div className="font-display text-[15.5px] font-semibold text-ink">{partner?.fullName}</div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              online ? 'animate-pulse-dot bg-online' : 'bg-offline'
            }`}
          />
          <span className="text-xs text-muted">
            {handleOf(partner?.username)} · {status}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ChatPanel({
  thread,
  messages,
  meId,
  online,
  typing,
  hasOlder,
  onLoadOlder,
  onSend,
  onTyping,
  onStopTyping,
  onBack,
  className = '',
}) {
  return (
    <section
      className={`flex min-w-0 flex-1 flex-col bg-chatbg transition-colors duration-500 ${className}`}
    >
      {!thread ? (
        <EmptyState />
      ) : (
        <div className="flex h-full animate-fade flex-col">
          <Header
            partner={thread.partner}
            online={online}
            typing={typing}
            onBack={onBack}
          />

          <MessageList
            messages={messages}
            meId={meId}
            partnerId={thread.partner?.id}
            hasOlder={hasOlder}
            onLoadOlder={onLoadOlder}
          />

          <Composer onSend={onSend} onTyping={onTyping} onStopTyping={onStopTyping} />
        </div>
      )}
    </section>
  );
}
