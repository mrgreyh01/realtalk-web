'use client';

import { useEffect, useRef, useState } from 'react';
import { SendIcon } from '@/components/ui/icons';

export default function Composer({ onSend, onTyping, onStopTyping }) {
  const [text, setText] = useState('');
  const areaRef = useRef(null);

  const canSend = text.trim().length > 0;

  // Grow the box up to the cap in the design, then let it scroll.
  useEffect(() => {
    const area = areaRef.current;
    if (!area) {
      return;
    }
    area.style.height = 'auto';
    area.style.height = `${Math.min(area.scrollHeight, 96)}px`;
  }, [text]);

  function submit() {
    if (!canSend) {
      return;
    }
    onSend(text);
    setText('');
  }

  function onKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  function onChange(event) {
    setText(event.target.value);
    if (event.target.value.trim()) {
      onTyping();
    } else {
      onStopTyping();
    }
  }

  return (
    <div className="bg-chatbg px-[22px] pb-5 pt-3.5">
      <div className="flex items-end gap-2.5 rounded-[18px] border-[1.5px] border-line bg-window py-2 pl-[18px] pr-2 transition-colors duration-500">
        <textarea
          ref={areaRef}
          rows={1}
          value={text}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onBlur={onStopTyping}
          placeholder="Type a message"
          className="scroll-thin max-h-24 flex-1 border-none bg-transparent py-2 text-sm leading-relaxed text-ink outline-none"
        />

        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Send message"
          className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] text-white transition-all duration-200 ${
            canSend
              ? 'bg-accent shadow-[0_8px_18px_-6px_var(--accent)]'
              : 'cursor-default bg-faint'
          }`}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
