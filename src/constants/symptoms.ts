import { SymptomDefinition } from '../types';

export const PREDEFINED_SYMPTOMS: SymptomDefinition[] = [
  { id: 'fatigue', label: 'Fatigue', inputType: 'slider' },
  { id: 'brainFog', label: 'Brain fog', inputType: 'slider' },
  { id: 'tingling', label: 'Tingling in hands/feet', inputType: 'yesNoLocation' },
  { id: 'restlessLegs', label: 'Restless legs', inputType: 'yesNoSeverity' },
  { id: 'coldIntolerance', label: 'Cold intolerance', inputType: 'yesNo' },
  { id: 'lowLibido', label: 'Low libido', inputType: 'yesNo' },
  { id: 'heavyPeriods', label: 'Heavy periods', inputType: 'yesNoFlow' },
  { id: 'mood', label: 'Mood', inputType: 'slider' },
  { id: 'motivation', label: 'Motivation', inputType: 'slider' },
  { id: 'sleepQuality', label: 'Sleep quality', inputType: 'slider' },
];

export const DEFAULT_LAB_TESTS = [
  { name: 'Ferritin', unit: 'ng/mL', refLow: 12, refHigh: 150 },
  { name: 'B12', unit: 'pg/mL', refLow: 200, refHigh: 900 },
  { name: 'HGB', unit: 'g/dL', refLow: 12, refHigh: 16 },
];

export const PERIOD_SYMPTOM_OPTIONS = [
  'Cramps',
  'Fatigue',
  'Headache',
  'Bloating',
  'Mood swings',
  'Back pain',
];
