const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse YYYY-MM-DD as local noon to avoid DST / UTC day-shift bugs. */
export function parseISODate(dateStr: string): Date {
  return new Date(dateStr + 'T12:00:00');
}

/** Format a Date as YYYY-MM-DD in the device's local time zone. */
export function dateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return dateToISO(new Date());
}

export function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return dateToISO(d);
}

export function eachDateInRange(startIso: string, endIso: string): string[] {
  const dates: string[] = [];
  const cursor = parseISODate(startIso);
  const end = parseISODate(endIso);

  while (cursor <= end) {
    dates.push(dateToISO(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseISODate(dateStr);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getCurrentTimeSlot(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function isTimeSlotPast(slot: 'morning' | 'afternoon' | 'evening'): boolean {
  const hour = new Date().getHours();
  if (slot === 'morning') return hour >= 12;
  if (slot === 'afternoon') return hour >= 17;
  return false;
}

export function timeSlotLabel(slot: 'morning' | 'afternoon' | 'evening'): string {
  const labels = { morning: 'Morning · 8 AM', afternoon: 'Afternoon · 1 PM', evening: 'Evening · 8 PM' };
  return labels[slot];
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function isValidISODate(dateStr: string): boolean {
  if (!ISO_DATE_RE.test(dateStr)) return false;
  const date = parseISODate(dateStr);
  return !Number.isNaN(date.getTime()) && dateToISO(date) === dateStr;
}
