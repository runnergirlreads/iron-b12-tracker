import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FlowLevel } from '../types';
import { borderRadius, onPrimary, spacing, touchTarget } from '../constants/theme';

const OPTIONS: { value: FlowLevel; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
];

interface FlowPickerProps {
  value: FlowLevel | undefined;
  onChange: (value: FlowLevel) => void;
}

export function FlowPicker({ value, onChange }: FlowPickerProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: selected ? colors.primary : colors.card,
                borderColor: selected ? colors.primary : colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text
              style={{
                color: selected ? onPrimary : colors.text,
                fontWeight: '600',
                fontSize: 14,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  button: {
    flex: 1,
    minHeight: touchTarget.minSize,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
});
