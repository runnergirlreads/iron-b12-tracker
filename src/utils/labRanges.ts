import { LabResult } from '../types';
import { ThemeColors } from '../constants/theme';

export type RangeStatus = 'normal' | 'warning' | 'danger';

export function getLabRangeStatus(result: LabResult): RangeStatus {
  const { value, refLow, refHigh } = result;
  if (refLow == null && refHigh == null) return 'normal';

  if (refLow != null && value < refLow) {
    const margin = refLow * 0.1;
    return value < refLow - margin ? 'danger' : 'warning';
  }
  if (refHigh != null && value > refHigh) {
    const margin = refHigh * 0.1;
    return value > refHigh + margin ? 'danger' : 'warning';
  }
  return 'normal';
}

export function getRangeColor(status: RangeStatus, colors: ThemeColors): string {
  switch (status) {
    case 'danger':
      return colors.danger;
    case 'warning':
      return colors.warning;
    default:
      return colors.success;
  }
}
