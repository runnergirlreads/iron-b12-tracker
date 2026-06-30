import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { onPrimary, spacing, touchTarget } from '../constants/theme';

interface SeveritySliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

export function SeveritySlider({ value, onChange, label }: SeveritySliderProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <View style={styles.row}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityLabel={`Severity ${n} of 10`}
            accessibilityState={{ selected: n <= value }}
            onPress={() => onChange(n)}
            hitSlop={touchTarget.hitSlop}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: n <= value ? colors.primary : colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: n <= value ? onPrimary : colors.textSecondary }]}>
              {n}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.valueLabel, { color: colors.text }]}>Severity: {value}/10</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: spacing.xs },
  label: { fontSize: 14, marginBottom: spacing.xs },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontSize: 13, fontWeight: '700' },
  valueLabel: { fontSize: 14, marginTop: spacing.sm, fontWeight: '500' },
});
