import { PeriodEntry } from '../types';
import { eachDateInRange } from './dates';

export { eachDateInRange };

export function getPeriodEndDate(period: PeriodEntry): string {
  return period.endDate ?? period.startDate;
}

export function isDateInPeriod(date: string, period: PeriodEntry): boolean {
  const end = getPeriodEndDate(period);
  return date >= period.startDate && date <= end;
}

export function findPeriodForDate(periods: PeriodEntry[], date: string): PeriodEntry | null {
  return periods.find((p) => isDateInPeriod(date, p)) ?? null;
}

export function getDaySymptoms(period: PeriodEntry, date: string): string[] {
  if (period.daySymptoms?.[date]) {
    return period.daySymptoms[date];
  }
  if (
    period.symptoms.length > 0 &&
    date === period.startDate &&
    !period.daySymptoms
  ) {
    return period.symptoms;
  }
  return [];
}

export function hasDaySymptoms(period: PeriodEntry, date: string): boolean {
  return getDaySymptoms(period, date).length > 0;
}

export function formatPeriodSymptomSummary(period: PeriodEntry): string {
  const dates = eachDateInRange(period.startDate, getPeriodEndDate(period));
  const daysWithSymptoms = dates.filter((d) => hasDaySymptoms(period, d));
  if (daysWithSymptoms.length === 0) {
    return 'Tap calendar days to log daily symptoms';
  }

  const unique = new Set<string>();
  for (const d of daysWithSymptoms) {
    getDaySymptoms(period, d).forEach((s) => unique.add(s));
  }

  const dayLabel = daysWithSymptoms.length === 1 ? '1 day' : `${daysWithSymptoms.length} days`;
  return `${[...unique].join(', ')} · logged on ${dayLabel}`;
}

export function pruneDaySymptoms(
  daySymptoms: Record<string, string[]> | undefined,
  startDate: string,
  endDate?: string,
): Record<string, string[]> {
  const end = endDate ?? startDate;
  const pruned: Record<string, string[]> = {};
  for (const [date, symptoms] of Object.entries(daySymptoms ?? {})) {
    if (date >= startDate && date <= end && symptoms.length > 0) {
      pruned[date] = symptoms;
    }
  }
  return pruned;
}
