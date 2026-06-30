export type SymptomType =
  | 'fatigue'
  | 'brainFog'
  | 'tingling'
  | 'restlessLegs'
  | 'coldIntolerance'
  | 'lowLibido'
  | 'heavyPeriods'
  | 'mood'
  | 'motivation'
  | 'sleepQuality'
  | string;

export type FlowLevel = 'light' | 'medium' | 'heavy';
export type TimeSlot = 'morning' | 'afternoon' | 'evening';
export type ThemeMode = 'light' | 'dark' | 'system';
export type UnitSystem = 'us' | 'metric';

export interface SymptomEntry {
  id: string;
  date: string;
  symptom: SymptomType;
  severity?: number;
  yesNo?: boolean;
  location?: string;
  flow?: FlowLevel;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: TimeSlot[];
  inventory?: number;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  date: string;
  timeSlot: TimeSlot;
  taken: boolean;
}

export interface CustomLabTest {
  name: string;
  unit: string;
  refLow?: number;
  refHigh?: number;
}

export interface LabResult {
  id: string;
  testName: string;
  value: number;
  unit: string;
  date: string;
  refLow?: number;
  refHigh?: number;
  targetMin?: number;
  attachmentUri?: string;
  attachmentName?: string;
  attachmentKind?: 'image' | 'pdf';
}

export interface PeriodEntry {
  id: string;
  startDate: string;
  endDate?: string;
  flow: FlowLevel;
  /** @deprecated Use daySymptoms for per-day tracking. */
  symptoms: string[];
  /** Symptoms logged for specific dates within the period range. */
  daySymptoms?: Record<string, string[]>;
}

export interface FoodEntry {
  id: string;
  date: string;
  meal: string;
  notes: string;
}

export interface Note {
  id: string;
  date: string;
  text: string;
  tags: string[];
}

export interface UserProfile {
  name: string;
  age?: number;
  gender?: string;
  allergies?: string;
  conditions?: string;
  baselineLabs: LabResult[];
  medications: Medication[];
}

export interface AppSettings {
  themeMode: ThemeMode;
  unitSystem: UnitSystem;
  medicationReminders: boolean;
}

export type SymptomInputType = 'slider' | 'yesNo' | 'yesNoLocation' | 'yesNoSeverity' | 'yesNoFlow';

export interface SymptomDefinition {
  id: SymptomType;
  label: string;
  inputType: SymptomInputType;
}
