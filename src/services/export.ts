import {
  AppSettings,
  CustomLabTest,
  FoodEntry,
  LabResult,
  MedicationLog,
  Note,
  PeriodEntry,
  SymptomEntry,
  UserProfile,
} from '../types';
import { eachDateInRange } from '../utils/periodDays';

export interface HealthBackup {
  version: 1;
  exportedAt: string;
  profile: UserProfile;
  symptoms: SymptomEntry[];
  medLogs: MedicationLog[];
  labs: LabResult[];
  customLabTests?: CustomLabTest[];
  periods: PeriodEntry[];
  food: FoodEntry[];
  notes: Note[];
  settings: AppSettings;
}

export interface HealthExportData {
  profile: UserProfile;
  symptoms: SymptomEntry[];
  medLogs: MedicationLog[];
  labs: LabResult[];
  customLabTests?: CustomLabTest[];
  periods: PeriodEntry[];
  food: FoodEntry[];
  notes: Note[];
  settings: AppSettings;
}

function csvEscape(value: string | number | boolean | undefined | null): string {
  if (value == null || value === '') return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function csvRow(values: (string | number | boolean | undefined | null)[]): string {
  return values.map(csvEscape).join(',');
}

export function buildHealthCsv(data: HealthExportData): string {
  const medNameById = new Map(data.profile.medications.map((m) => [m.id, m.name]));
  const lines: string[] = [];

  lines.push('Symptoms');
  lines.push(csvRow(['date', 'symptom', 'severity', 'yes_no', 'location', 'flow', 'notes']));
  for (const s of [...data.symptoms].sort((a, b) => b.date.localeCompare(a.date))) {
    lines.push(
      csvRow([s.date, s.symptom, s.severity, s.yesNo, s.location, s.flow, s.notes]),
    );
  }

  lines.push('');
  lines.push('Lab Results');
  lines.push(csvRow(['date', 'test_name', 'value', 'unit', 'ref_low', 'ref_high', 'attachment']));
  for (const l of [...data.labs].sort((a, b) => b.date.localeCompare(a.date))) {
    lines.push(
      csvRow([l.date, l.testName, l.value, l.unit, l.refLow, l.refHigh, l.attachmentName]),
    );
  }

  lines.push('');
  lines.push('Baseline Labs');
  lines.push(csvRow(['date', 'test_name', 'value', 'unit', 'ref_low', 'ref_high']));
  for (const l of data.profile.baselineLabs) {
    lines.push(csvRow([l.date, l.testName, l.value, l.unit, l.refLow, l.refHigh]));
  }

  lines.push('');
  lines.push('Medication Logs');
  lines.push(csvRow(['date', 'medication', 'time_slot', 'taken']));
  for (const log of [...data.medLogs].sort((a, b) => b.date.localeCompare(a.date))) {
    lines.push(
      csvRow([
        log.date,
        medNameById.get(log.medicationId) ?? log.medicationId,
        log.timeSlot,
        log.taken,
      ]),
    );
  }

  lines.push('');
  lines.push('Periods');
  lines.push(csvRow(['start_date', 'end_date', 'flow']));
  for (const p of [...data.periods].sort((a, b) => b.startDate.localeCompare(a.startDate))) {
    lines.push(csvRow([p.startDate, p.endDate, p.flow]));
  }

  lines.push('');
  lines.push('Period Day Symptoms');
  lines.push(csvRow(['period_start', 'date', 'symptoms']));
  for (const p of data.periods) {
    const end = p.endDate ?? p.startDate;
    for (const date of eachDateInRange(p.startDate, end)) {
      const symptoms = p.daySymptoms?.[date] ?? (p.symptoms.length > 0 && date === p.startDate && !p.daySymptoms ? p.symptoms : []);
      if (symptoms.length > 0) {
        lines.push(csvRow([p.startDate, date, symptoms.join('; ')]));
      }
    }
  }

  lines.push('');
  lines.push('Food Journal');
  lines.push(csvRow(['date', 'meal', 'notes']));
  for (const f of [...data.food].sort((a, b) => b.date.localeCompare(a.date))) {
    lines.push(csvRow([f.date, f.meal, f.notes]));
  }

  lines.push('');
  lines.push('Notes');
  lines.push(csvRow(['date', 'text', 'tags']));
  for (const n of [...data.notes].sort((a, b) => b.date.localeCompare(a.date))) {
    lines.push(csvRow([n.date, n.text, n.tags.map((t) => `#${t}`).join(' ')]));
  }

  return lines.join('\n');
}

export function buildHealthBackup(data: HealthExportData): HealthBackup {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    ...data,
  };
}

export function parseHealthBackup(json: string): HealthBackup {
  const parsed = JSON.parse(json) as HealthBackup;
  if (parsed.version !== 1) {
    throw new Error('Unsupported backup version');
  }
  if (!parsed.profile || !Array.isArray(parsed.symptoms)) {
    throw new Error('Invalid backup file');
  }
  return parsed;
}
