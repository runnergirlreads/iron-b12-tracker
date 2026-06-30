import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { StorageService } from './storage';
import {
  buildHealthBackup,
  buildHealthCsv,
  HealthBackup,
  HealthExportData,
  parseHealthBackup,
} from './export';
import { todayISO } from '../utils/dates';

async function shareTextFile(filename: string, content: string, mimeType: string): Promise<void> {
  const file = new File(Paths.document, filename);
  file.write(content);

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device');
  }

  await Sharing.shareAsync(file.uri, { mimeType, UTI: mimeType });
}

export async function loadExportData(): Promise<HealthExportData> {
  const [profile, symptoms, medLogs, labs, customLabTests, periods, food, notes, settings] = await Promise.all([
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

  return { profile, symptoms, medLogs, labs, customLabTests, periods, food, notes, settings };
}

export async function exportCsv(): Promise<void> {
  const data = await loadExportData();
  const csv = buildHealthCsv(data);
  const filename = `health-export-${todayISO()}.csv`;
  await shareTextFile(filename, csv, 'text/csv');
}

export async function exportBackup(): Promise<void> {
  const data = await loadExportData();
  const backup = buildHealthBackup(data);
  const json = JSON.stringify(backup, null, 2);
  const filename = `health-backup-${todayISO()}.json`;
  await shareTextFile(filename, json, 'application/json');
}

export async function pickAndRestoreBackup(): Promise<HealthBackup> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) {
    throw new Error('cancelled');
  }

  const pickedFile = new File(result.assets[0].uri);
  const content = await pickedFile.text();

  const backup = parseHealthBackup(content);
  await importBackup(backup);
  return backup;
}

export async function importBackup(backup: HealthBackup): Promise<void> {
  await Promise.all([
    StorageService.saveProfile(backup.profile),
    StorageService.saveSymptoms(backup.symptoms),
    StorageService.saveMedLogs(backup.medLogs),
    StorageService.saveLabs(backup.labs),
    StorageService.saveCustomLabTests(backup.customLabTests ?? []),
    StorageService.savePeriods(backup.periods),
    StorageService.saveFood(backup.food),
    StorageService.saveNotes(backup.notes),
    StorageService.saveSettings(backup.settings),
  ]);
}
