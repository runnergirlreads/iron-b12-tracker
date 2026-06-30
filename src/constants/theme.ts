export const lightTheme = {
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  primary: '#4F46E5',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  border: '#E5E7EB',
};

export const darkTheme = {
  background: '#0F0F1A',
  card: '#1A1A2E',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  primary: '#818CF8',
  danger: '#F87171',
  warning: '#FBBF24',
  success: '#34D399',
  border: '#374151',
};

export type ThemeColors = typeof lightTheme;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
};

/** WCAG 2.5.5 / iOS HIG minimum touch target (44×44 pt). */
export const touchTarget = {
  minSize: 44,
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
};

/** High-contrast text on primary-colored buttons (meets WCAG AA on #4F46E5). */
export const onPrimary = '#FFFFFF';
