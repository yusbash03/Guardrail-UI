export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
const dateTimeFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const longDateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const clockFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
const shortClockFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

/** DESIGN_SYSTEM.md §8: relative for < 24 h ("2 min ago"), else "MMM d, h:mm a". */
export function formatWhen(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  const diffSeconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 45) return 'Just now';
  if (diffSeconds < 3600) return `${Math.max(1, Math.round(diffSeconds / 60))} min ago`;
  if (diffSeconds < 86400) return `${Math.round(diffSeconds / 3600)} h ago`;
  return dateTimeFormat.format(date);
}

export const formatDate = (iso: string) => dateFormat.format(new Date(iso));
export const formatLongDate = (iso: string) => longDateFormat.format(new Date(iso));
export const formatDateTime = (iso: string) => `${longDateFormat.format(new Date(iso))} · ${shortClockFormat.format(new Date(iso))}`;
export const formatClockTime = (iso: string) => clockFormat.format(new Date(iso));
export const formatShortTime = (iso: string) => shortClockFormat.format(new Date(iso));

/** Whole seconds until an ISO timestamp (never negative). */
export function secondsUntil(iso: string): number {
  return Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000));
}
