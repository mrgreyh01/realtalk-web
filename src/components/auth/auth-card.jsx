'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import BrandPanel from './brand-panel';
import PasswordStrength from './password-strength';
import { PasswordField, TextField } from './fields';
import { ArrowRightIcon } from '@/components/ui/icons';

const EMPTY = { fullName: '', username: '', password: '' };

function tabClass(active) {
  return [
    'flex-1 rounded-[9px] py-[9px] font-display text-[13px] font-semibold transition-all duration-200',
    active ? 'bg-window text-accent shadow-[0_2px_8px_rgba(30,55,110,.1)]' : 'text-muted',
  ].join(' ');
}

export default function AuthCard() {
  const router = useRouter();
  const { login, signup } = useAuth();

  const [mode, setMode] = useState('signup');
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isSignup = mode === 'signup';

  const setField = (key) => (value) => setValues((current) => ({ ...current, [key]: value }));

  const switchMode = (next) => {
    setMode(next);
    setError('');
  };

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const username = values.username.replace(/^@/, '').trim();

      if (isSignup) {
        await signup({
          fullName: values.fullName.trim(),
          username,
          password: values.password,
        });
      } else {
        await login({ username, password: values.password });
      }

      router.replace('/chat');
    } catch (cause) {
      const detail = cause.details?.[0]?.message;
      setError(detail || cause.message);
      setBusy(false);
    }
  }

  return (
    <div className="relative z-[2] flex min-h-[640px] w-full max-w-[1000px] animate-pop overflow-hidden rounded-[26px] bg-window shadow-window transition-colors duration-500 max-[900px]:min-h-[100dvh] max-[900px]:rounded-none max-[900px]:shadow-none">
      <BrandPanel />

      <form
        onSubmit={submit}
        className="flex flex-1 flex-col justify-center p-12 px-[56px] max-[900px]:justify-start max-[900px]:px-6 max-[900px]:py-12"
      >
        <div className="mb-10 flex w-full rounded-xl bg-field p-1">
          <button type="button" onClick={() => switchMode('signin')} className={tabClass(!isSignup)}>
            Sign in
          </button>
          <button type="button" onClick={() => switchMode('signup')} className={tabClass(isSignup)}>
            Create account
          </button>
        </div>

        <h1 className="mb-2 font-display text-[26px] font-semibold text-ink">
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mb-8 text-[14.5px] text-muted">
          {isSignup
            ? 'Join RealTalk in a few seconds.'
            : 'Sign in to continue your conversations.'}
        </p>

        {isSignup && (
          <div className="animate-rise">
            <TextField
              name="fullName"
              label="Full name"
              value={values.fullName}
              onChange={setField('fullName')}
              placeholder="Ralph Hitman"
              autoComplete="name"
              data-lpignore="true"
              data-1p-ignore
              data-bwignore
            />
          </div>
        )}

        <div className="animate-rise">
          <TextField
            name="username"
            label="Username"
            value={values.username}
            onChange={setField('username')}
            placeholder="@ralph_hitman"
            autoComplete="username"
          />
        </div>

        <PasswordField
          name="password"
          label="Password"
          value={values.password}
          onChange={setField('password')}
          placeholder={isSignup ? 'Enter a strong password' : 'Enter your password'}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
        />

        {isSignup && <PasswordStrength password={values.password} />}

        {error && (
          <p className="mb-3 rounded-xl bg-danger/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-display text-[15px] font-semibold text-white shadow-[0_12px_24px_-8px_var(--accent)] transition hover:brightness-105 active:scale-[.98] disabled:opacity-70"
        >
          {busy ? 'Please wait' : isSignup ? 'Create account' : 'Sign in'}
          {!busy && <ArrowRightIcon />}
        </button>
      </form>
    </div>
  );
}
