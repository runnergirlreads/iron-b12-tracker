import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { StorageService } from '../services/storage';
import { AppSettings, ThemeMode, UnitSystem } from '../types';
import { darkTheme, lightTheme, ThemeColors } from '../constants/theme';

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    StorageService.getSettings().then((settings) => {
      setThemeModeState(settings.themeMode);
    });
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    const settings = await StorageService.getSettings();
    await StorageService.saveSettings({ ...settings, themeMode: mode });
  }, []);

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  const colors = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ colors, isDark, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function useAppSettings(): AppSettings {
  const { themeMode } = useTheme();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('us');
  const [medicationReminders, setMedicationReminders] = useState(false);

  useEffect(() => {
    StorageService.getSettings().then((s) => {
      setUnitSystem(s.unitSystem);
      setMedicationReminders(s.medicationReminders);
    });
  }, []);

  return { themeMode, unitSystem, medicationReminders };
}

export async function saveUnitSystem(unitSystem: 'us' | 'metric') {
  const settings = await StorageService.getSettings();
  await StorageService.saveSettings({ ...settings, unitSystem });
}
