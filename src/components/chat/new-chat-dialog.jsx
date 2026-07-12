'use client';

import { useEffect, useMemo, useState } from 'react';
import Avatar from '@/components/ui/avatar';
import { BubbleIcon, SearchIcon } from '@/components/ui/icons';
import { users as usersApi } from '@/lib/endpoints';
import { handleOf } from '@/lib/format';

export default function NewChatDialog({ open, existingIds, onlineIds, onPick, onClose }) {
  const [directory, setDirectory] = useState([]);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const controller = new AbortController();
    setQuery('');
    setError('');

    usersApi
      .list(controller.signal)
      .then((payload) => setDirectory(payload.data))
      .catch((cause) => {
        if (cause.name !== 'AbortError') {
          setError(cause.message);
        }
      });

    return () => controller.abort();
  }, [open]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return directory;
    }
    return directory.filter(
      (person) =>
        person.fullName.toLowerCase().includes(term) ||
        person.username.toLowerCase().includes(term),
    );
  }, [directory, query]);

  if (!open) {
    return null;
  }

  async function pick(person) {
    setBusyId(person.id);
    try {
      await onPick(person.id);
      onClose();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="absolute inset-0 z-20 flex animate-fade items-center justify-center bg-[rgba(20,32,60,.4)] p-8 backdrop-blur-[3px]"
    >
      <div
        role="dialog"
        aria-label="New chat"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[82%] w-[440px] max-w-full animate-pop flex-col overflow-hidden rounded-[22px] bg-window shadow-window"
      >
        <div className="flex items-center justify-between px-[22px] pb-3.5 pt-5">
          <h3 className="font-display text-[17px] font-semibold text-ink">New chat</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[13px] font-semibold text-accent"
          >
            Cancel
          </button>
        </div>

        <div className="px-[22px] pb-3.5">
          <div className="relative">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or @username"
              className="w-full rounded-[13px] border-[1.5px] border-transparent bg-field py-3 pl-10 pr-3.5 text-[13.5px] text-ink transition-colors focus:border-accent"
            />
          </div>
        </div>

        {error && (
          <p className="mx-[22px] mb-3 rounded-xl bg-danger/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-danger">
            {error}
          </p>
        )}

        <div className="scroll-thin flex-1 overflow-y-auto px-3 pb-4">
          {visible.map((person) => {
            const added = existingIds.includes(person.id);

            return (
              <div
                key={person.id}
                className="flex items-center gap-3 rounded-[14px] px-2.5 py-[9px] transition-colors hover:bg-field"
              >
                <Avatar
                  user={person}
                  size="sm"
                  presence={onlineIds.includes(person.id)}
                  ringClass="border-window"
                />

                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-sm font-semibold text-ink">
                    {person.fullName}
                  </div>
                  <div className="text-xs text-muted">{handleOf(person.username)}</div>
                </div>

                <button
                  type="button"
                  disabled={busyId === person.id}
                  onClick={() => pick(person)}
                  className={`flex shrink-0 items-center rounded-[11px] px-[15px] py-2 font-display text-[13px] font-semibold transition-all disabled:opacity-60 ${
                    added ? 'bg-field text-accent' : 'bg-accent text-white'
                  }`}
                >
                  <BubbleIcon size={14} className="mr-1.5" />
                  {added ? 'Open' : 'Chat'}
                </button>
              </div>
            );
          })}

          {visible.length === 0 && !error && (
            <p className="px-5 py-8 text-center text-[13px] text-muted">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
