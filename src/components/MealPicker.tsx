import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Chip } from './Chip';
import { spacing } from '../constants/theme';

export const MEAL_OPTIONS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;
export type MealOption = (typeof MEAL_OPTIONS)[number];

interface MealPickerProps {
  value: string;
  onChange: (meal: MealOption) => void;
}

export function MealPicker({ value, onChange }: MealPickerProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.text }]}>Meal</Text>
      <View style={styles.row}>
        {MEAL_OPTIONS.map((meal) => (
          <Chip
            key={meal}
            label={meal}
            selected={value === meal}
            onPress={() => onChange(meal)}
            style={styles.chip}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm },
  label: { fontSize: 16, fontWeight: '600', marginBottom: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { flexGrow: 1, flexBasis: '45%', marginRight: spacing.sm },
});
