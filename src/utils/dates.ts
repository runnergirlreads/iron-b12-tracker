export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
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

export function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidISODate(dateStr: string): boolean {
  if (!ISO_DATE_RE.test(dateStr)) return false;
  const date = new Date(dateStr + 'T12:00:00');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === dateStr;
}

export function parseISODate(dateStr: string): Date {
  return new Date(dateStr + 'T12:00:00');
}

export function dateToISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}
