'use client';

import { useMemo, useState } from 'react';
import ProfileBar from './profile-bar';
import ConversationList from './conversation-list';
import { SearchIcon } from '@/components/ui/icons';

export default function Sidebar({
  threads,
  activeId,
  onlineIds,
  loading,
  onSelect,
  onAddContact,
  className = '',
}) {
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return threads;
    }

    return threads.filter((thread) => {
      const partner = thread.partner;
      if (!partner) {
        return false;
      }
      return (
        partner.fullName.toLowerCase().includes(term) ||
        partner.username.toLowerCase().includes(term)
      );
    });
  }, [threads, query]);

  return (
    <aside
      className={`flex min-w-0 flex-col bg-sidebar transition-colors duration-500 md:w-[340px] md:flex-none md:border-r md:border-line ${className}`}
    >
      <ProfileBar onAddContact={onAddContact} />

      <div className="px-5 pb-3.5 pt-1.5">
        <div className="relative">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search contacts"
            className="w-full rounded-[13px] border-[1.5px] border-transparent bg-field py-[11px] pl-10 pr-3.5 text-[13.5px] text-ink transition-colors focus:border-accent"
          />
        </div>
      </div>

      <ConversationList
        threads={visible}
        activeId={activeId}
        onlineIds={onlineIds}
        loading={loading}
        onSelect={onSelect}
      />
    </aside>
  );
}
