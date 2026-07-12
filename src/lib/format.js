const AVATAR_COLORS = [
  '#6C5CE7',
  '#00B894',
  '#E17055',
  '#0984E3',
  '#D63031',
  '#E1A100',
  '#E84393',
  '#00A8A8',
];

export function initialsOf(fullName) {
  if (!fullName) {
    return '?';
  }

  return fullName
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Same id always lands on the same colour, so avatars stay stable on reload. */
export function avatarColor(id = '') {
  let total = 0;
  for (let i = 0; i < id.length; i += 1) {
    total = (total + id.charCodeAt(i)) % 997;
  }
  return AVATAR_COLORS[total % AVATAR_COLORS.length];
}

export function handleOf(username) {
  if (!username) {
    return '';
  }
  return username.startsWith('@') ? username : `@${username}`;
}

export function clockTime(value) {
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Short stamp for the contact list, the way a messaging app usually shows it. */
export function listTime(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000);

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  if (days === 1) {
    return 'Yesterday';
  }
  if (days < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  return date.toLocaleDateString([], { month: 'short', day: '2-digit' });
}

export function dayLabel(value) {
  return new Date(value)
    .toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
    .toUpperCase();
}

export function sameDay(a, b) {
  return startOfDay(new Date(a)).getTime() === startOfDay(new Date(b)).getTime();
}

/**
 * Turns the delivery arrays the backend keeps into the three states the design
 * shows: a clock while it is only stored, one pair of ticks once the other side
 * has it, and coloured ticks once they have read it.
 */
export function deliveryState(message, partnerId) {
  if (message.pending) {
    return 'sent';
  }
  if (partnerId && message.readBy?.some((id) => String(id) === String(partnerId))) {
    return 'read';
  }
  if (partnerId && message.deliveredTo?.some((id) => String(id) === String(partnerId))) {
    return 'delivered';
  }
  return 'sent';
}

export function passwordScore(password) {
  if (!password) {
    return 0;
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return Math.max(1, score);
}
