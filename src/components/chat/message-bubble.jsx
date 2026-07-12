import { ClockIcon, TicksIcon, WarningIcon } from '@/components/ui/icons';
import { clockTime, deliveryState } from '@/lib/format';

function StatusMark({ message, partnerId }) {
  if (message.failed) {
    return (
      <span className="flex items-center gap-1 text-danger">
        <WarningIcon />
        Not sent
      </span>
    );
  }

  const state = deliveryState(message, partnerId);

  if (state === 'sent') {
    return <ClockIcon />;
  }

  return <TicksIcon read={state === 'read'} />;
}

export default function MessageBubble({ message, mine, partnerId }) {
  return (
    <div className={`mb-3.5 flex animate-rise flex-col ${mine ? 'items-end' : 'items-start'}`}>
      <div
        className={`break-words max-w-[66%] px-[15px] py-[11px] text-sm leading-relaxed ${
          mine
            ? 'rounded-[17px] rounded-br-[5px] bg-accent text-white shadow-[0_6px_16px_-6px_var(--accent)]'
            : 'rounded-[17px] rounded-bl-[5px] bg-bubble text-bubbleink shadow-[0_1px_2px_rgba(30,50,90,.06)]'
        }`}
      >
        {message.body}
      </div>

      <div className="mx-1 mt-1 flex items-center gap-[5px] text-[11px] text-muted">
        <span>{clockTime(message.createdAt)}</span>
        {mine && <StatusMark message={message} partnerId={partnerId} />}
      </div>
    </div>
  );
}
