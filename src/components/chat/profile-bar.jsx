'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { AccentAvatar } from '@/components/ui/avatar';
import { ChevronDownIcon, LogoutIcon, MoonIcon, PlusIcon, SunIcon } from '@/components/ui/icons';
import { handleOf } from '@/lib/format';

export default function ProfileBar({ onAddContact }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  async function signOut() {
    setMenuOpen(false);
    await logout();
    router.replace('/login');
  }

  return (
    <div className="relative px-4 pb-3 pt-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          title="Account menu"
          className="flex min-w-0 flex-1 items-center gap-3 rounded-[15px] px-1.5 py-[5px] transition-colors hover:bg-field"
        >
          <AccentAvatar fullName={user?.fullName} />

          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate font-display text-[15px] font-semibold text-ink">
              {user?.fullName}
            </span>
            <span className="block truncate text-xs text-muted">{handleOf(user?.username)}</span>
          </span>

          <ChevronDownIcon
            className={`text-muted transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <button
          type="button"
          onClick={onAddContact}
          title="Add contact"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-accentsoft text-accent transition-transform hover:scale-105 active:scale-95"
        >
          <PlusIcon />
        </button>

        <button
          type="button"
          onClick={toggle}
          title="Toggle theme"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-field text-muted transition-transform duration-300 hover:rotate-45"
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-[14] cursor-default"
          />

          <div className="absolute left-4 top-[70px] z-[15] w-[236px] animate-pop-fast rounded-2xl border border-line bg-window p-[7px] shadow-menu">
            <div className="mb-1.5 border-b border-line px-[11px] pb-2.5 pt-[9px]">
              <div className="truncate font-display text-[13.5px] font-semibold text-ink">
                {user?.fullName}
              </div>
              <div className="text-[11.5px] text-muted">{handleOf(user?.username)}</div>
            </div>

            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-[11px] rounded-[10px] px-[11px] py-[9px] text-[13.5px] font-semibold text-danger transition-colors hover:bg-danger/10"
            >
              <LogoutIcon />
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
