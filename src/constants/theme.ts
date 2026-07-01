/** Blue-teal primary, green secondary, warm background, coral accent. */
export const lightTheme = {
  background: '#F7F6F3',
  card: '#FFFFFF',
  text: '#1A2B33',
  textSecondary: '#5F6E76',
  primary: '#2D8FA3',
  secondary: '#3A9468',
  accent: '#E8956F',
  danger: '#C94C4C',
  warning: '#D49848',
  success: '#3A9468',
  border: '#E0E3E6',
  primarySurface: '#E5F3F6',
  secondarySurface: '#E8F3ED',
  accentSurface: '#FDF0E8',
  periodFlow: {
    light: '#B8DCC8',
    medium: '#F0C990',
    heavy: '#E8AAAA',
  },
};

export const darkTheme = {
  background: '#141A1D',
  card: '#1E272B',
  text: '#F4F2EF',
  textSecondary: '#A0ADB2',
  primary: '#4AADBE',
  secondary: '#52B87E',
  accent: '#F0A67E',
  danger: '#E07070',
  warning: '#E0B060',
  success: '#52B87E',
  border: '#2F3A40',
  primarySurface: '#1E3338',
  secondarySurface: '#1E3328',
  accentSurface: '#3A2E28',
  periodFlow: {
    light: '#3D6B52',
    medium: '#8A6B3D',
    heavy: '#7A4545',
  },
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

/** High-contrast text on primary-colored buttons (meets WCAG AA on primary blue-teal). */
export const onPrimary = '#FFFFFF';

export type PeriodFlowColors = ThemeColors['periodFlow'];
