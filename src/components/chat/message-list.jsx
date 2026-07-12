'use client';

import { useEffect, useRef } from 'react';
import MessageBubble from './message-bubble';
import { dayLabel, sameDay } from '@/lib/format';

export default function MessageList({ messages, meId, partnerId, hasOlder, onLoadOlder }) {
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const countRef = useRef(0);

  // Stick to the bottom when a new message lands or when opening a chat, 
  // but leave the scroll position alone when an older page is prepended.
  useEffect(() => {
    const grew = messages.length > countRef.current;
    const jumped = messages.length - countRef.current > 5;
    const isInitialLoad = countRef.current === 0;
    
    countRef.current = messages.length;

    if (grew && (!jumped || isInitialLoad)) {
      bottomRef.current?.scrollIntoView({ block: 'end' });
    }
  }, [messages]);

  useEffect(() => {
    // Reset the counter when switching chats so the next message render is treated as an initial load
    countRef.current = 0;
  }, [partnerId]);

  function onScroll(event) {
    if (hasOlder && event.currentTarget.scrollTop < 40) {
      onLoadOlder();
    }
  }

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="scroll-thin flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-6 pb-3 pt-[22px]"
    >
      {hasOlder && (
        <button
          type="button"
          onClick={onLoadOlder}
          className="mx-auto mb-4 rounded-full bg-window px-4 py-1.5 text-[11px] font-semibold text-muted"
        >
          Load earlier messages
        </button>
      )}

      {messages.map((message, index) => {
        const previous = messages[index - 1];
        const newDay = !previous || !sameDay(previous.createdAt, message.createdAt);

        return (
          <div key={message.id}>
            {newDay && (
              <div className="mb-4 text-center">
                <span className="rounded-full bg-window px-3.5 py-[5px] text-[11px] font-semibold tracking-wide text-faint">
                  {dayLabel(message.createdAt)}
                </span>
              </div>
            )}

            <MessageBubble
              message={message}
              mine={message.sender?.id === meId}
              partnerId={partnerId}
            />
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
