import { PeriodEntry } from '../types';
import { PeriodFlowColors } from '../constants/theme';
import { dateToISO, parseISODate } from './dates';

export function predictNextPeriod(periods: PeriodEntry[]): string | null {
  if (periods.length < 2) return null;

  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const cycleLengths: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const prev = parseISODate(sorted[i - 1].startDate);
    const curr = parseISODate(sorted[i].startDate);
    const days = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (days > 0 && days < 60) cycleLengths.push(days);
  }

  if (cycleLengths.length === 0) return null;

  const avgCycle = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
  const lastStart = parseISODate(sorted[sorted.length - 1].startDate);
  lastStart.setDate(lastStart.getDate() + avgCycle);
  return dateToISO(lastStart);
}

export function getPeriodDatesForCalendar(
  periods: PeriodEntry[],
  flowColors: PeriodFlowColors,
  calendarTextColor: string,
): Record<
  string,
  {
    customStyles: {
      container: {
        backgroundColor: string;
        borderRadius: number;
        borderWidth?: number;
        borderColor?: string;
      };
      text: { color: string; fontWeight: 'bold' };
    };
  }
> {
  const marked: Record<
    string,
    {
      customStyles: {
        container: {
          backgroundColor: string;
          borderRadius: number;
          borderWidth?: number;
          borderColor?: string;
        };
        text: { color: string; fontWeight: 'bold' };
      };
    }
  > = {};
  const flowColorMap = flowColors;

  for (const period of periods) {
    const start = parseISODate(period.startDate);
    const end = period.endDate
      ? parseISODate(period.endDate)
      : parseISODate(period.startDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = dateToISO(d);
      marked[key] = {
        customStyles: {
          container: { backgroundColor: flowColorMap[period.flow], borderRadius: 16 },
          text: { color: calendarTextColor, fontWeight: 'bold' },
        },
      };
    }
  }

  return marked;
}
