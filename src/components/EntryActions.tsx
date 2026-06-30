import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing, touchTarget } from '../constants/theme';

interface EntryActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function EntryActions({ onEdit, onDelete }: EntryActionsProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Edit entry"
        onPress={onEdit}
        style={({ pressed }) => [
          styles.btn,
          { borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 15 }}>Edit</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Delete entry"
        onPress={onDelete}
        style={({ pressed }) => [
          styles.btn,
          { borderColor: colors.danger + '66', opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={{ color: colors.danger, fontWeight: '600', fontSize: 15 }}>Delete</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  btn: {
    minHeight: touchTarget.minSize,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
