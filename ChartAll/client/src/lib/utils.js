import { format, isToday, isYesterday, parseISO } from 'date-fns';

export function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(d, 'HH:mm');
}

export function formatDateDivider(dateStr) {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMMM d, yyyy');
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');
}

export function dmKey(a, b) {
  return [a, b].sort().join('_');
}

// Group messages by date for dividers
export function groupByDate(messages) {
  const groups = [];
  let lastDate = null;
  for (const msg of messages) {
    const date = formatDateDivider(msg.createdAt);
    if (date !== lastDate) {
      groups.push({ type: 'divider', date });
      lastDate = date;
    }
    groups.push({ type: 'message', data: msg });
  }
  return groups;
}
