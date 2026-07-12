'use client';

import Avatar from '@/components/ui/avatar';
import { listTime } from '@/lib/format';

function ConversationRow({ thread, active, online, onSelect }) {
  const partner = thread.partner;

  return (
    <button
      type="button"
      onClick={() => onSelect(thread.id)}
      className={`mb-0.5 flex w-full items-center gap-3 rounded-[15px] px-3 py-[11px] transition-colors ${
        active ? 'bg-accentsoft' : 'hover:bg-field'
      }`}
    >
      <Avatar user={partner} presence={online} />

      <span className="min-w-0 flex-1 text-left">
        <span className="flex items-center justify-between gap-1.5">
          <span className="truncate font-display text-sm font-semibold text-ink">
            {partner?.fullName}
          </span>
          <span className="shrink-0 text-[11px] text-faint">{listTime(thread.lastMessageAt)}</span>
        </span>

        <span className="mt-[3px] flex items-center justify-between gap-1.5">
          <span className="truncate text-[12.5px] text-muted">
            {thread.preview || 'No messages yet'}
          </span>

          {thread.unreadCount > 0 && (
            <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-accent px-[5px] text-[10.5px] font-bold text-white">
              {thread.unreadCount}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

export default function ConversationList({ threads, activeId, onlineIds, loading, onSelect }) {
  if (loading) {
    return <p className="px-4 py-6 text-center text-[13px] text-muted">Loading conversations</p>;
  }

  if (threads.length === 0) {
    return (
      <p className="px-6 py-8 text-center text-[13px] leading-relaxed text-muted">
        No conversations yet. Use the plus button to start one.
      </p>
    );
  }

  return (
    <div className="scroll-thin flex-1 overflow-y-auto px-3 pb-3">
      {threads.map((thread) => (
        <ConversationRow
          key={thread.id}
          thread={thread}
          active={thread.id === activeId}
          online={onlineIds.includes(thread.partner?.id)}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
