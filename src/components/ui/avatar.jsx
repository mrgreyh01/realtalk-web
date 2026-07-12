import { avatarColor, initialsOf } from '@/lib/format';

const SIZES = {
  sm: 'w-[42px] h-[42px] rounded-xl text-sm',
  md: 'w-11 h-11 rounded-[13px] text-[15px]',
  lg: 'w-[46px] h-[46px] rounded-[14px] text-base',
};

export default function Avatar({ user, size = 'md', presence = null, ringClass = 'border-sidebar' }) {
  const background = avatarColor(user?.id);

  return (
    <div className="relative shrink-0">
      <div
        className={`${SIZES[size]} flex items-center justify-center font-display font-semibold text-white`}
        style={{ background }}
      >
        {initialsOf(user?.fullName)}
      </div>

      {presence !== null && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-[13px] w-[13px] rounded-full border-[2.5px] ${ringClass} ${
            presence ? 'bg-online' : 'bg-offline'
          }`}
        />
      )}
    </div>
  );
}

export function AccentAvatar({ fullName, size = 'lg' }) {
  return (
    <div
      className={`${SIZES[size]} flex shrink-0 items-center justify-center bg-gradient-to-br from-accent to-accent2 font-display font-semibold text-white shadow-[0_6px_14px_-6px_var(--accent)]`}
    >
      {initialsOf(fullName)}
    </div>
  );
}
