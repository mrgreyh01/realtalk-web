'use client';

import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from '@/components/ui/icons';

const FIELD =
  'w-full rounded-xl border-[1.5px] border-transparent bg-field px-[15px] py-[13px] text-sm text-ink transition-colors focus:border-accent';

export function TextField({ label, value, onChange, placeholder, autoComplete, name, ...rest }) {
  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="mb-1.5 block text-xs font-semibold text-muted"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={FIELD}
        {...rest}
      />
    </div>
  );
}

export function PasswordField({ label, value, onChange, placeholder, autoComplete, name, ...rest }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-xs font-semibold text-muted">
        {label}
      </label>
      <div className="relative mb-2.5">
        <input
          id={name}
          name={name}
          type={revealed ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`${FIELD} pr-[72px]`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setRevealed((current) => !current)}
          aria-label={revealed ? 'Hide password' : 'Show password'}
          className="absolute right-10 top-1/2 flex -translate-y-1/2 text-muted"
        >
          {revealed ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}
