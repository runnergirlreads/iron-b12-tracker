import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, onPrimary, spacing, touchTarget } from '../constants/theme';

interface YesNoToggleProps {
  value: boolean | undefined;
  onChange: (value: boolean) => void;
}

export function YesNoToggle({ value, onChange }: YesNoToggleProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {(['Yes', 'No'] as const).map((label, idx) => {
        const selected = value === (idx === 0);
        return (
          <Pressable
            key={label}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(idx === 0)}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: selected ? colors.primary : colors.card,
                borderColor: selected ? colors.primary : colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={{ color: selected ? onPrimary : colors.text, fontWeight: '600', fontSize: 16 }}>
              {label}
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
    paddingHorizontal: spacing.md,
  },
});
