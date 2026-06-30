import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { Card } from '../components/Card';
import { useTheme, saveUnitSystem } from '../context/ThemeContext';
import { useHealthData } from '../context/DataContext';
import { StorageService } from '../services/storage';
import { exportBackup, exportCsv, pickAndRestoreBackup } from '../services/backup';
import {
  requestNotificationPermissions,
  syncAllMedicationReminders,
} from '../services/notifications';
import { ThemeMode, UnitSystem } from '../types';
import { spacing } from '../constants/theme';

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const UNIT_OPTIONS: { value: UnitSystem; label: string }[] = [
  { value: 'us', label: 'US (ng/mL, g/dL)' },
  { value: 'metric', label: 'Metric (µg/L, mmol/L)' },
];

export default function SettingsScreen() {
  const { colors, themeMode, setThemeMode } = useTheme();
  const { getMedications, reloadFromStorage } = useHealthData();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('us');
  const [medicationReminders, setMedicationReminders] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadSettings = async () => {
    const s = await StorageService.getSettings();
    setUnitSystem(s.unitSystem);
    setMedicationReminders(s.medicationReminders ?? false);
    setThemeMode(s.themeMode);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleUnitChange = async (unit: UnitSystem) => {
    setUnitSystem(unit);
    await saveUnitSystem(unit);
  };

  const handleRemindersToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Permission required',
          'Enable notifications in Settings to receive medication reminders.',
        );
        return;
      }
    }

    setMedicationReminders(enabled);
    const settings = await StorageService.getSettings();
    await StorageService.saveSettings({ ...settings, medicationReminders: enabled });
    await syncAllMedicationReminders(getMedications(), enabled);
  };

  const runExport = async (type: 'csv' | 'backup') => {
    try {
      setExporting(true);
      if (type === 'csv') {
        await exportCsv();
      } else {
        await exportBackup();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed';
      Alert.alert('Export failed', message);
    } finally {
      setExporting(false);
    }
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore backup',
      'This will replace all current data with the backup file. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              setExporting(true);
              await pickAndRestoreBackup();
              await reloadFromStorage();
              await loadSettings();
              Alert.alert('Restored', 'Your data has been restored from the backup.');
            } catch (err) {
              if (err instanceof Error && err.message === 'cancelled') return;
              const message = err instanceof Error ? err.message : 'Restore failed';
              Alert.alert('Restore failed', message);
            } finally {
              setExporting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.section, { color: colors.text }]}>Appearance</Text>
        <Card>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Theme</Text>
          <View style={styles.optionRow}>
            {THEME_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setThemeMode(opt.value)}
                style={[
                  styles.option,
                  {
                    backgroundColor: themeMode === opt.value ? colors.primary : colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={{ color: themeMode === opt.value ? '#fff' : colors.text, fontWeight: '600' }}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Text style={[styles.section, { color: colors.text }]}>Notifications</Text>
        <Card>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>Medication reminders</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
                Daily alerts at 8 AM, 1 PM, and 8 PM
              </Text>
            </View>
            <Switch
              value={medicationReminders}
              onValueChange={handleRemindersToggle}
              trackColor={{ false: colors.border, true: colors.primary + '88' }}
              thumbColor={medicationReminders ? colors.primary : '#f4f4f5'}
            />
          </View>
        </Card>

        <Text style={[styles.section, { color: colors.text }]}>Units</Text>
        <Card>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Lab result display preference (stored for future use)
          </Text>
          {UNIT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => handleUnitChange(opt.value)}
              style={[
                styles.unitOption,
                {
                  backgroundColor: unitSystem === opt.value ? colors.primary + '18' : 'transparent',
                  borderColor: unitSystem === opt.value ? colors.primary : colors.border,
                },
              ]}
            >
              <View style={[styles.radio, { borderColor: colors.primary }]}>
                {unitSystem === opt.value && (
                  <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
              <Text style={{ color: colors.text }}>{opt.label}</Text>
            </Pressable>
          ))}
        </Card>

        <Text style={[styles.section, { color: colors.text }]}>Data & Export</Text>
        <Card>
          <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.md }]}>
            Share health data with your doctor or keep a local backup
          </Text>

          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => runExport('csv')}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionBtnText}>Export CSV for doctor</Text>
            )}
          </Pressable>

          <Pressable
            style={[styles.actionBtn, styles.actionBtnOutline, { borderColor: colors.primary }]}
            onPress={() => runExport('backup')}
            disabled={exporting}
          >
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>Backup all data (JSON)</Text>
          </Pressable>

          <Pressable
            style={[styles.actionBtn, styles.actionBtnOutline, { borderColor: colors.border }]}
            onPress={handleRestore}
            disabled={exporting}
          >
            <Text style={[styles.actionBtnText, { color: colors.text }]}>Restore from backup</Text>
          </Pressable>
        </Card>

        <Text style={[styles.section, { color: colors.text }]}>About</Text>
        <Card>
          <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>Iron & B12 Tracker</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4, fontSize: 13 }}>
            Version 1.0.0 · Local storage only
          </Text>
        </Card>
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 18, fontWeight: '600', marginTop: spacing.md, marginBottom: spacing.sm },
  label: { fontSize: 13, marginBottom: spacing.sm },
  optionRow: { flexDirection: 'row', gap: spacing.sm },
  option: { flex: 1, paddingVertical: spacing.sm, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  unitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  actionBtn: {
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
