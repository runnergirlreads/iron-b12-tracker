import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Medication, TimeSlot } from '../types';
import { isTimeSlotPast, timeSlotLabel } from '../utils/dates';
import { Card } from './Card';
import { spacing, touchTarget, borderRadius } from '../constants/theme';

interface MedicationCardProps {
  medication: Medication;
  takenSlots: Record<TimeSlot, boolean>;
  onToggle: (slot: TimeSlot) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MedicationCard({ medication, takenSlots, onToggle, onEdit, onDelete }: MedicationCardProps) {
  const { colors } = useTheme();

  return (
    <Card>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.text }]}>{medication.name}</Text>
          <Text style={[styles.dosage, { color: colors.textSecondary }]}>
            {medication.dosage} · {medication.frequency}
          </Text>
        </View>
        {(onEdit || onDelete) && (
          <View style={styles.actionRow}>
            {onEdit && (
              <Pressable
                accessibilityRole="button"
                onPress={onEdit}
                style={styles.headerAction}
              >
                <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 15 }}>Edit</Text>
              </Pressable>
            )}
            {onDelete && (
              <Pressable
                accessibilityRole="button"
                onPress={onDelete}
                style={styles.headerAction}
              >
                <Text style={{ color: colors.danger, fontWeight: '600', fontSize: 15 }}>Delete</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
      {medication.times.map((slot) => {
        const taken = takenSlots[slot];
        const missed = !taken && isTimeSlotPast(slot);
        return (
          <View key={slot} style={styles.slotRow}>
            <View style={styles.slotInfo}>
              <Text style={[styles.slotLabel, { color: missed ? colors.textSecondary : colors.text }]}>
                {timeSlotLabel(slot)}
              </Text>
              {missed && (
                <Text style={[styles.missed, { color: colors.danger }]}>Missed</Text>
              )}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => onToggle(slot)}
              style={({ pressed }) => [
                styles.checkButton,
                {
                  backgroundColor: taken ? colors.secondarySurface : colors.card,
                  borderColor: taken ? colors.secondary : colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={{ color: taken ? colors.secondary : colors.text, fontWeight: '600', fontSize: 14 }}>
                {taken ? 'Taken' : 'Mark taken'}
              </Text>
            </Pressable>
          </View>
        );
      })}
      {medication.inventory != null && (
        <Text style={[styles.inventory, { color: colors.textSecondary }]}>
          {medication.inventory} pills remaining
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.xs },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginLeft: spacing.sm },
  headerAction: {
    minHeight: touchTarget.minSize,
    minWidth: touchTarget.minSize,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  name: { fontSize: 17, fontWeight: '700', marginBottom: 2 },
  dosage: { fontSize: 14, marginBottom: spacing.sm },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  slotInfo: { flex: 1 },
  slotLabel: { fontSize: 14 },
  missed: { fontSize: 12, marginTop: 2 },
  checkButton: {
    minHeight: touchTarget.minSize,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inventory: { fontSize: 12, marginTop: spacing.sm },
});
