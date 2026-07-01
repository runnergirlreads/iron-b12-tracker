import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../constants/theme';
import { SymptomEntry } from '../types';

export type SeverityTier = 'low' | 'medium' | 'high';

export interface SymptomChipIcon {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  accessibilityText: string;
}

export function getSeverityTier(severity: number): SeverityTier {
  if (severity <= 3) return 'low';
  if (severity <= 6) return 'medium';
  return 'high';
}

function tierIcon(tier: SeverityTier, colors: ThemeColors): SymptomChipIcon {
  switch (tier) {
    case 'low':
      return {
        name: 'checkmark-circle-outline',
        color: colors.secondary,
        accessibilityText: 'low severity',
      };
    case 'medium':
      return {
        name: 'warning-outline',
        color: colors.warning,
        accessibilityText: 'medium severity',
      };
    case 'high':
      return {
        name: 'alert-circle',
        color: colors.danger,
        accessibilityText: 'high severity',
      };
  }
}

export function getSymptomChipIcon(
  entry: SymptomEntry,
  colors: ThemeColors,
): SymptomChipIcon | null {
  if (entry.severity != null) {
    return tierIcon(getSeverityTier(entry.severity), colors);
  }

  if (entry.yesNo != null) {
    return entry.yesNo
      ? {
          name: 'checkmark-circle',
          color: colors.secondary,
          accessibilityText: 'yes',
        }
      : {
          name: 'close-circle-outline',
          color: colors.textSecondary,
          accessibilityText: 'no',
        };
  }

  return null;
}

export function getSymptomChipAccessibilityLabel(
  symptomLabel: string,
  icon: SymptomChipIcon | null,
): string {
  if (!icon) return symptomLabel;
  return `${symptomLabel}, ${icon.accessibilityText}`;
}
