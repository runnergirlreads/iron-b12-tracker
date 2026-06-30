import { PeriodEntry } from '../types';

export function predictNextPeriod(periods: PeriodEntry[]): string | null {
  if (periods.length < 2) return null;

  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const cycleLengths: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].startDate + 'T12:00:00');
    const curr = new Date(sorted[i].startDate + 'T12:00:00');
    const days = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (days > 0 && days < 60) cycleLengths.push(days);
  }

  if (cycleLengths.length === 0) return null;

  const avgCycle = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
  const lastStart = new Date(sorted[sorted.length - 1].startDate + 'T12:00:00');
  lastStart.setDate(lastStart.getDate() + avgCycle);
  return lastStart.toISOString().slice(0, 10);
}

export function getPeriodDatesForCalendar(periods: PeriodEntry[]): Record<
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
  const flowColors = {
    light: '#86EFAC',
    medium: '#FCD34D',
    heavy: '#FCA5A5',
  };

  for (const period of periods) {
    const start = new Date(period.startDate + 'T12:00:00');
    const end = period.endDate
      ? new Date(period.endDate + 'T12:00:00')
      : new Date(period.startDate + 'T12:00:00');

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      marked[key] = {
        customStyles: {
          container: { backgroundColor: flowColors[period.flow], borderRadius: 16 },
          text: { color: '#1A1A2E', fontWeight: 'bold' },
        },
      };
    }
  }

  return marked;
}
