import { PREDEFINED_SYMPTOMS } from '../constants/symptoms';
import {
  LabResult,
  Medication,
  MedicationLog,
  SymptomEntry,
} from '../types';
import { daysAgoISO, eachDateInRange, todayISO } from './dates';
import { getLabRangeStatus } from './labRanges';

export type ReportPeriod = 7 | 30;

export interface SymptomReportItem {
  symptom: string;
  label: string;
  avgSeverity?: number;
  daysLogged: number;
  yesDays?: number;
  yesPercent?: number;
}

export interface MedicationAdherenceItem {
  medicationId: string;
  name: string;
  taken: number;
  expected: number;
  percent: number;
}

export interface LabTrendItem {
  testName: string;
  latest: LabResult;
  previous?: LabResult;
  delta?: number;
  deltaPercent?: number;
}

function inRange(date: string, days: ReportPeriod): boolean {
  return date >= daysAgoISO(days - 1) && date <= todayISO();
}

function getSymptomLabel(id: string): string {
  return PREDEFINED_SYMPTOMS.find((s) => s.id === id)?.label ?? id.replace(/_/g, ' ');
}

export function computeSymptomReport(
  symptoms: SymptomEntry[],
  days: ReportPeriod,
): SymptomReportItem[] {
  const filtered = symptoms.filter((s) => inRange(s.date, days));
  const bySymptom = new Map<string, SymptomEntry[]>();

  for (const entry of filtered) {
    const list = bySymptom.get(entry.symptom) ?? [];
    list.push(entry);
    bySymptom.set(entry.symptom, list);
  }

  const items: SymptomReportItem[] = [];

  for (const [symptom, entries] of bySymptom) {
    const severityEntries = entries.filter((e) => e.severity != null);
    const yesNoEntries = entries.filter((e) => e.yesNo != null);

    if (severityEntries.length > 0) {
      const avg =
        severityEntries.reduce((sum, e) => sum + (e.severity ?? 0), 0) / severityEntries.length;
      items.push({
        symptom,
        label: getSymptomLabel(symptom),
        avgSeverity: Math.round(avg * 10) / 10,
        daysLogged: new Set(severityEntries.map((e) => e.date)).size,
      });
    } else if (yesNoEntries.length > 0) {
      const yesCount = yesNoEntries.filter((e) => e.yesNo).length;
      const uniqueDays = new Set(yesNoEntries.map((e) => e.date)).size;
      items.push({
        symptom,
        label: getSymptomLabel(symptom),
        daysLogged: uniqueDays,
        yesDays: yesCount,
        yesPercent: Math.round((yesCount / yesNoEntries.length) * 100),
      });
    }
  }

  return items.sort((a, b) => (b.avgSeverity ?? 0) - (a.avgSeverity ?? 0));
}

export function computeMedicationAdherence(
  medications: Medication[],
  medLogs: MedicationLog[],
  days: ReportPeriod,
): MedicationAdherenceItem[] {
  const startDate = daysAgoISO(days - 1);
  const endDate = todayISO();
  const datesInRange = eachDateInRange(startDate, endDate);

  return medications.map((med) => {
    const expected = datesInRange.length * med.times.length;
    const taken = medLogs.filter(
      (log) =>
        log.medicationId === med.id &&
        log.taken &&
        log.date >= startDate &&
        log.date <= endDate,
    ).length;

    return {
      medicationId: med.id,
      name: med.name,
      taken,
      expected,
      percent: expected > 0 ? Math.round((taken / expected) * 100) : 0,
    };
  });
}

export function computeLabTrends(labs: LabResult[]): LabTrendItem[] {
  const byTest = new Map<string, LabResult[]>();

  for (const lab of labs) {
    const list = byTest.get(lab.testName) ?? [];
    list.push(lab);
    byTest.set(lab.testName, list);
  }

  const trends: LabTrendItem[] = [];

  for (const [testName, results] of byTest) {
    const sorted = [...results].sort((a, b) => b.date.localeCompare(a.date));
    const latest = sorted[0];
    const previous = sorted[1];

    const item: LabTrendItem = { testName, latest };
    if (previous) {
      item.previous = previous;
      item.delta = Math.round((latest.value - previous.value) * 10) / 10;
      item.deltaPercent =
        previous.value !== 0
          ? Math.round(((latest.value - previous.value) / previous.value) * 100)
          : undefined;
    }
    trends.push(item);
  }

  return trends.sort((a, b) => a.testName.localeCompare(b.testName));
}

export function periodLabel(days: ReportPeriod): string {
  return days === 7 ? 'Past 7 days' : 'Past 30 days';
}

export { getLabRangeStatus };
