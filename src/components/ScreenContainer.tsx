import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../constants/theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

export function ScreenContainer({ children, style, padded = true }: ScreenContainerProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.inner, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  inner: { flex: 1 },
  padded: { paddingHorizontal: spacing.md },
});
