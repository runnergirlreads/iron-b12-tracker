import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import {
  syncAllMedicationReminders,
  cancelMedicationReminders,
  scheduleMedicationReminders,
} from '../services/notifications';
import {
  CustomLabTest,
  FoodEntry,
  LabResult,
  Medication,
  MedicationLog,
  Note,
  PeriodEntry,
  SymptomEntry,
  TimeSlot,
  UserProfile,
} from '../types';
import { generateId, todayISO } from '../utils/dates';
import { pruneDaySymptoms } from '../utils/periodDays';
import { buildCustomLabTestNames, isDefaultLabTest } from '../utils/labTests';

interface DataContextValue {
  loading: boolean;
  profile: UserProfile;
  symptoms: SymptomEntry[];
  medLogs: MedicationLog[];
  labs: LabResult[];
  customLabTests: CustomLabTest[];
  periods: PeriodEntry[];
  food: FoodEntry[];
  notes: Note[];
  updateProfile: (profile: UserProfile) => Promise<void>;
  saveSymptomEntries: (entries: SymptomEntry[], date: string, notes?: string) => Promise<void>;
  addMedication: (med: Omit<Medication, 'id'>) => Promise<void>;
  updateMedication: (id: string, med: Omit<Medication, 'id'>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  toggleMedicationLog: (medicationId: string, timeSlot: TimeSlot, date?: string) => Promise<void>;
  addLabResult: (lab: Omit<LabResult, 'id'>) => Promise<string>;
  updateLabResult: (id: string, lab: Omit<LabResult, 'id'>) => Promise<void>;
  deleteLabResult: (id: string) => Promise<void>;
  registerCustomLabTest: (test: CustomLabTest) => Promise<void>;
  addPeriod: (period: Omit<PeriodEntry, 'id'>) => Promise<void>;
  updatePeriod: (id: string, period: Omit<PeriodEntry, 'id'>) => Promise<void>;
  updatePeriodDaySymptoms: (periodId: string, date: string, symptoms: string[]) => Promise<void>;
  deletePeriod: (id: string) => Promise<void>;
  addFoodEntry: (entry: Omit<FoodEntry, 'id'>) => Promise<void>;
  updateFoodEntry: (id: string, entry: Omit<FoodEntry, 'id'>) => Promise<void>;
  deleteFoodEntry: (id: string) => Promise<void>;
  addNote: (text: string, date?: string) => Promise<void>;
  updateNote: (id: string, text: string, date?: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addBaselineLab: (lab: Omit<LabResult, 'id'>) => Promise<void>;
  updateBaselineLab: (id: string, lab: Omit<LabResult, 'id'>) => Promise<void>;
  deleteBaselineLab: (id: string) => Promise<void>;
  getTodaySymptoms: () => SymptomEntry[];
  getMedications: () => Medication[];
  isMedicationTaken: (medicationId: string, timeSlot: TimeSlot, date?: string) => boolean;
  reloadFromStorage: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

async function shouldSyncReminders(): Promise<boolean> {
  const settings = await StorageService.getSettings();
  return settings.medicationReminders ?? false;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({ name: '', baselineLabs: [], medications: [] });
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [medLogs, setMedLogs] = useState<MedicationLog[]>([]);
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [customLabTests, setCustomLabTests] = useState<CustomLabTest[]>([]);
  const [periods, setPeriods] = useState<PeriodEntry[]>([]);
  const [food, setFood] = useState<FoodEntry[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const reloadFromStorage = useCallback(async () => {
    const [p, s, m, l, clt, pe, f, n, settings] = await Promise.all([
      StorageService.getProfile(),
      StorageService.getSymptoms(),
      StorageService.getMedLogs(),
      StorageService.getLabs(),
      StorageService.getCustomLabTests(),
      StorageService.getPeriods(),
      StorageService.getFood(),
      StorageService.getNotes(),
      StorageService.getSettings(),
    ]);
    setProfile(p);
    setSymptoms(s);
    setMedLogs(m);
    setLabs(l);
    const migratedCustomTests = [...clt];
    for (const name of buildCustomLabTestNames([], l)) {
      if (migratedCustomTests.some((test) => test.name === name)) continue;
      const sample = l.find((lab) => lab.testName === name);
      if (!sample) continue;
      migratedCustomTests.push({
        name,
        unit: sample.unit,
        refLow: sample.refLow,
        refHigh: sample.refHigh,
      });
    }
    if (migratedCustomTests.length !== clt.length) {
      await StorageService.saveCustomLabTests(migratedCustomTests);
    }
    setCustomLabTests(migratedCustomTests);
    setPeriods(pe);
    setFood(f);
    setNotes(n);

    if (settings.medicationReminders) {
      await syncAllMedicationReminders(p.medications, true);
    }
  }, []);

  useEffect(() => {
    async function hydrate() {
      await reloadFromStorage();
      setLoading(false);
    }
    hydrate();
  }, [reloadFromStorage]);

  const updateProfile = useCallback(async (updated: UserProfile) => {
    setProfile(updated);
    await StorageService.saveProfile(updated);
  }, []);

  const saveSymptomEntries = useCallback(
    async (entries: SymptomEntry[], date: string, dayNotes?: string) => {
      const withoutDate = symptoms.filter((s) => s.date !== date);
      const withNotes = dayNotes
        ? entries.map((e, i) => (i === 0 ? { ...e, notes: dayNotes } : e))
        : entries;
      const updated = [...withoutDate, ...withNotes];
      setSymptoms(updated);
      await StorageService.saveSymptoms(updated);
    },
    [symptoms],
  );

  const addMedication = useCallback(
    async (med: Omit<Medication, 'id'>) => {
      const newMed: Medication = { ...med, id: generateId() };
      const updated = { ...profile, medications: [...profile.medications, newMed] };
      setProfile(updated);
      await StorageService.saveProfile(updated);
      if (await shouldSyncReminders()) {
        await scheduleMedicationReminders(newMed);
      }
    },
    [profile],
  );

  const updateMedication = useCallback(
    async (id: string, med: Omit<Medication, 'id'>) => {
      const existing = profile.medications.find((m) => m.id === id);
      if (!existing) return;

      const updatedMed: Medication = { ...med, id };
      const updated = {
        ...profile,
        medications: profile.medications.map((m) => (m.id === id ? updatedMed : m)),
      };
      setProfile(updated);
      await StorageService.saveProfile(updated);

      if (await shouldSyncReminders()) {
        await cancelMedicationReminders(id, existing.times);
        await scheduleMedicationReminders(updatedMed);
      }
    },
    [profile],
  );

  const deleteMedication = useCallback(
    async (id: string) => {
      const existing = profile.medications.find((m) => m.id === id);
      if (!existing) return;

      const updated = {
        ...profile,
        medications: profile.medications.filter((m) => m.id !== id),
      };
      setProfile(updated);
      await StorageService.saveProfile(updated);
      await cancelMedicationReminders(id, existing.times);
    },
    [profile],
  );

  const toggleMedicationLog = useCallback(
    async (medicationId: string, timeSlot: TimeSlot, date?: string) => {
      const logDate = date ?? todayISO();
      const existing = medLogs.find(
        (l) => l.medicationId === medicationId && l.timeSlot === timeSlot && l.date === logDate,
      );
      let updated: MedicationLog[];
      if (existing) {
        updated = medLogs.map((l) =>
          l.id === existing.id ? { ...l, taken: !l.taken } : l,
        );
      } else {
        updated = [
          ...medLogs,
          { id: generateId(), medicationId, date: logDate, timeSlot, taken: true },
        ];
      }
      setMedLogs(updated);
      await StorageService.saveMedLogs(updated);
    },
    [medLogs],
  );

  const registerCustomLabTest = useCallback(
    async (test: CustomLabTest) => {
      if (isDefaultLabTest(test.name)) return;
      const existing = customLabTests.find((t) => t.name === test.name);
      const nextTest = existing ? { ...existing, ...test } : test;
      const updated = existing
        ? customLabTests.map((t) => (t.name === test.name ? nextTest : t))
        : [...customLabTests, nextTest];
      setCustomLabTests(updated);
      await StorageService.saveCustomLabTests(updated);
    },
    [customLabTests],
  );

  const persistCustomLabIfNeeded = useCallback(
    async (lab: Omit<LabResult, 'id'>) => {
      if (isDefaultLabTest(lab.testName)) return;
      await registerCustomLabTest({
        name: lab.testName,
        unit: lab.unit,
        refLow: lab.refLow,
        refHigh: lab.refHigh,
      });
    },
    [registerCustomLabTest],
  );

  const addLabResult = useCallback(
    async (lab: Omit<LabResult, 'id'>) => {
      const newLab: LabResult = { ...lab, id: generateId() };
      const updated = [...labs, newLab];
      setLabs(updated);
      await StorageService.saveLabs(updated);
      await persistCustomLabIfNeeded(lab);
      return newLab.id;
    },
    [labs, persistCustomLabIfNeeded],
  );

  const updateLabResult = useCallback(
    async (id: string, lab: Omit<LabResult, 'id'>) => {
      const updated = labs.map((l) => (l.id === id ? { ...lab, id } : l));
      setLabs(updated);
      await StorageService.saveLabs(updated);
      await persistCustomLabIfNeeded(lab);
    },
    [labs, persistCustomLabIfNeeded],
  );

  const deleteLabResult = useCallback(
    async (id: string) => {
      const existing = labs.find((l) => l.id === id);
      const updated = labs.filter((l) => l.id !== id);
      setLabs(updated);
      await StorageService.saveLabs(updated);
      if (existing?.attachmentUri) {
        const { deleteLabAttachment } = await import('../services/labAttachments');
        deleteLabAttachment(existing.attachmentUri);
      }
    },
    [labs],
  );

  const addPeriod = useCallback(
    async (period: Omit<PeriodEntry, 'id'>) => {
      const updated = [...periods, { ...period, id: generateId() }];
      setPeriods(updated);
      await StorageService.savePeriods(updated);
    },
    [periods],
  );

  const updatePeriod = useCallback(
    async (id: string, period: Omit<PeriodEntry, 'id'>) => {
      const existing = periods.find((p) => p.id === id);
      const daySymptoms = pruneDaySymptoms(
        period.daySymptoms ?? existing?.daySymptoms,
        period.startDate,
        period.endDate,
      );
      const updated = periods.map((p) =>
        p.id === id ? { ...period, id, daySymptoms, symptoms: [] } : p,
      );
      setPeriods(updated);
      await StorageService.savePeriods(updated);
    },
    [periods],
  );

  const updatePeriodDaySymptoms = useCallback(
    async (periodId: string, date: string, symptoms: string[]) => {
      const updated = periods.map((p) => {
        if (p.id !== periodId) return p;
        const daySymptoms = { ...(p.daySymptoms ?? {}) };
        if (symptoms.length === 0) {
          delete daySymptoms[date];
        } else {
          daySymptoms[date] = symptoms;
        }
        return { ...p, daySymptoms, symptoms: [] };
      });
      setPeriods(updated);
      await StorageService.savePeriods(updated);
    },
    [periods],
  );

  const deletePeriod = useCallback(
    async (id: string) => {
      const updated = periods.filter((p) => p.id !== id);
      setPeriods(updated);
      await StorageService.savePeriods(updated);
    },
    [periods],
  );

  const addFoodEntry = useCallback(
    async (entry: Omit<FoodEntry, 'id'>) => {
      const updated = [...food, { ...entry, id: generateId() }];
      setFood(updated);
      await StorageService.saveFood(updated);
    },
    [food],
  );

  const updateFoodEntry = useCallback(
    async (id: string, entry: Omit<FoodEntry, 'id'>) => {
      const updated = food.map((f) => (f.id === id ? { ...entry, id } : f));
      setFood(updated);
      await StorageService.saveFood(updated);
    },
    [food],
  );

  const deleteFoodEntry = useCallback(
    async (id: string) => {
      const updated = food.filter((f) => f.id !== id);
      setFood(updated);
      await StorageService.saveFood(updated);
    },
    [food],
  );

  const parseNoteTags = (text: string) =>
    (text.match(/#\w+/g) ?? []).map((t) => t.slice(1).toLowerCase());

  const addNote = useCallback(
    async (text: string, date?: string) => {
      const newNote: Note = {
        id: generateId(),
        date: date ?? todayISO(),
        text,
        tags: parseNoteTags(text),
      };
      const updated = [newNote, ...notes];
      setNotes(updated);
      await StorageService.saveNotes(updated);
    },
    [notes],
  );

  const updateNote = useCallback(
    async (id: string, text: string, date?: string) => {
      const updated = notes.map((n) =>
        n.id === id
          ? { ...n, text, date: date ?? n.date, tags: parseNoteTags(text) }
          : n,
      );
      setNotes(updated);
      await StorageService.saveNotes(updated);
    },
    [notes],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      const updated = notes.filter((n) => n.id !== id);
      setNotes(updated);
      await StorageService.saveNotes(updated);
    },
    [notes],
  );

  const addBaselineLab = useCallback(
    async (lab: Omit<LabResult, 'id'>) => {
      const updated = {
        ...profile,
        baselineLabs: [...profile.baselineLabs, { ...lab, id: generateId() }],
      };
      setProfile(updated);
      await StorageService.saveProfile(updated);
    },
    [profile],
  );

  const updateBaselineLab = useCallback(
    async (id: string, lab: Omit<LabResult, 'id'>) => {
      const updated = {
        ...profile,
        baselineLabs: profile.baselineLabs.map((l) => (l.id === id ? { ...lab, id } : l)),
      };
      setProfile(updated);
      await StorageService.saveProfile(updated);
    },
    [profile],
  );

  const deleteBaselineLab = useCallback(
    async (id: string) => {
      const updated = {
        ...profile,
        baselineLabs: profile.baselineLabs.filter((l) => l.id !== id),
      };
      setProfile(updated);
      await StorageService.saveProfile(updated);
    },
    [profile],
  );

  const getTodaySymptoms = useCallback(() => {
    const today = todayISO();
    return symptoms.filter((s) => s.date === today);
  }, [symptoms]);

  const getMedications = useCallback(() => profile.medications, [profile.medications]);

  const isMedicationTaken = useCallback(
    (medicationId: string, timeSlot: TimeSlot, date?: string) => {
      const logDate = date ?? todayISO();
      return medLogs.some(
        (l) =>
          l.medicationId === medicationId &&
          l.timeSlot === timeSlot &&
          l.date === logDate &&
          l.taken,
      );
    },
    [medLogs],
  );

  return (
    <DataContext.Provider
      value={{
        loading,
        profile,
        symptoms,
        medLogs,
        labs,
        customLabTests,
        periods,
        food,
        notes,
        updateProfile,
        saveSymptomEntries,
        addMedication,
        updateMedication,
        deleteMedication,
        toggleMedicationLog,
        addLabResult,
        updateLabResult,
        deleteLabResult,
        registerCustomLabTest,
        addPeriod,
        updatePeriod,
        updatePeriodDaySymptoms,
        deletePeriod,
        addFoodEntry,
        updateFoodEntry,
        deleteFoodEntry,
        addNote,
        updateNote,
        deleteNote,
        addBaselineLab,
        updateBaselineLab,
        deleteBaselineLab,
        getTodaySymptoms,
        getMedications,
        isMedicationTaken,
        reloadFromStorage,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useHealthData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useHealthData must be used within DataProvider');
  return ctx;
}
