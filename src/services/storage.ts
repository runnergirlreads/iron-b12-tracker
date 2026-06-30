import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
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

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

const defaultProfile: UserProfile = {
  name: '',
  baselineLabs: [],
  medications: [],
};

const defaultSettings: AppSettings = {
  themeMode: 'system',
  unitSystem: 'us',
  medicationReminders: false,
};

export const StorageService = {
  getProfile: () => getJSON<UserProfile>(STORAGE_KEYS.profile, defaultProfile),
  saveProfile: (data: UserProfile) => setJSON(STORAGE_KEYS.profile, data),

  getSymptoms: () => getJSON<SymptomEntry[]>(STORAGE_KEYS.symptoms, []),
  saveSymptoms: (data: SymptomEntry[]) => setJSON(STORAGE_KEYS.symptoms, data),

  getMedLogs: () => getJSON<MedicationLog[]>(STORAGE_KEYS.medLogs, []),
  saveMedLogs: (data: MedicationLog[]) => setJSON(STORAGE_KEYS.medLogs, data),

  getLabs: () => getJSON<LabResult[]>(STORAGE_KEYS.labs, []),
  saveLabs: (data: LabResult[]) => setJSON(STORAGE_KEYS.labs, data),

  getPeriods: () => getJSON<PeriodEntry[]>(STORAGE_KEYS.periods, []),
  savePeriods: (data: PeriodEntry[]) => setJSON(STORAGE_KEYS.periods, data),

  getFood: () => getJSON<FoodEntry[]>(STORAGE_KEYS.food, []),
  saveFood: (data: FoodEntry[]) => setJSON(STORAGE_KEYS.food, data),

  getNotes: () => getJSON<Note[]>(STORAGE_KEYS.notes, []),
  saveNotes: (data: Note[]) => setJSON(STORAGE_KEYS.notes, data),

  getSettings: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.settings);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) } as AppSettings;
  },
  saveSettings: (data: AppSettings) => setJSON(STORAGE_KEYS.settings, data),

  getCustomLabTests: () => getJSON<CustomLabTest[]>(STORAGE_KEYS.customLabTests, []),
  saveCustomLabTests: (data: CustomLabTest[]) => setJSON(STORAGE_KEYS.customLabTests, data),

  clearAll: () => AsyncStorage.multiRemove(Object.values(STORAGE_KEYS)),
};
