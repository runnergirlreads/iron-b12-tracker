import { FlowLevel, PeriodEntry, SymptomEntry } from '../types';
import { daysAgoISO, eachDateInRange, todayISO } from './dates';

const FLOW_SCORE: Record<FlowLevel, number> = {
  light: 3,
  medium: 6,
  heavy: 9,
};

export interface PeriodCorrelationStats {
  onPeriodAvg: number | null;
  offPeriodAvg: number | null;
  onPeriodDays: number;
  offPeriodDays: number;
  difference: number | null;
}

export interface AlignedSymptomChart {
  labels: string[];
  severityData: number[];
  periodData: number[];
  hasPeriodOverlay: boolean;
}

export function getPeriodFlowByDate(
  periods: PeriodEntry[],
): Record<string, FlowLevel> {
  const map: Record<string, FlowLevel> = {};

  for (const period of periods) {
    const start = period.startDate;
    const end = period.endDate ?? period.startDate;
    for (const date of eachDateInRange(start, end)) {
      const existing = map[date];
      if (!existing) {
        map[date] = period.flow;
        continue;
      }
      const rank = { light: 1, medium: 2, heavy: 3 };
      if (rank[period.flow] > rank[existing]) {
        map[date] = period.flow;
      }
    }
  }

  return map;
}

export function getPeriodIntensityForDate(
  date: string,
  periods: PeriodEntry[],
): number {
  const flow = getPeriodFlowByDate(periods)[date];
  return flow ? FLOW_SCORE[flow] : 0;
}

export function computeSymptomPeriodCorrelation(
  symptoms: SymptomEntry[],
  periods: PeriodEntry[],
  symptomId: string,
  rangeDays: number,
): PeriodCorrelationStats | null {
  const since = daysAgoISO(rangeDays - 1);
  const periodDates = new Set(
    Object.keys(getPeriodFlowByDate(periods)).filter((d) => d >= since && d <= todayISO()),
  );

  const entries = symptoms.filter(
    (s) => s.symptom === symptomId && s.date >= since && s.severity != null,
  );

  if (entries.length === 0) return null;

  const onPeriod = entries.filter((e) => periodDates.has(e.date));
  const offPeriod = entries.filter((e) => !periodDates.has(e.date));

  const avg = (list: SymptomEntry[]) =>
    list.length === 0
      ? null
      : Math.round((list.reduce((sum, e) => sum + (e.severity ?? 0), 0) / list.length) * 10) / 10;

  const onPeriodAvg = avg(onPeriod);
  const offPeriodAvg = avg(offPeriod);

  return {
    onPeriodAvg,
    offPeriodAvg,
    onPeriodDays: new Set(onPeriod.map((e) => e.date)).size,
    offPeriodDays: new Set(offPeriod.map((e) => e.date)).size,
    difference:
      onPeriodAvg != null && offPeriodAvg != null
        ? Math.round((onPeriodAvg - offPeriodAvg) * 10) / 10
        : null,
  };
}

export function buildAlignedSymptomChart(
  symptoms: SymptomEntry[],
  periods: PeriodEntry[],
  symptomId: string,
  rangeDays: number,
): AlignedSymptomChart | null {
  const since = daysAgoISO(rangeDays - 1);
  const filtered = symptoms
    .filter((s) => s.symptom === symptomId && s.date >= since && s.severity != null)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (filtered.length === 0) return null;

  const periodDates = getPeriodFlowByDate(periods);
  const hasPeriodOverlay = filtered.some((entry) => periodDates[entry.date] != null);

  return {
    labels: filtered.map((s) => s.date.slice(5)),
    severityData: filtered.map((s) => s.severity!),
    periodData: filtered.map((s) => getPeriodIntensityForDate(s.date, periods)),
    hasPeriodOverlay,
  };
}

export function listPeriodRangesInRange(
  periods: PeriodEntry[],
  rangeDays: number,
): { label: string; flow: FlowLevel }[] {
  const since = daysAgoISO(rangeDays - 1);
  return [...periods]
    .filter((p) => p.startDate >= since || (p.endDate ?? p.startDate) >= since)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .map((p) => ({
      label: `${p.startDate}${p.endDate ? ` – ${p.endDate}` : ''}`,
      flow: p.flow,
    }));
}
