import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { MedicationCard } from '../components/MedicationCard';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';
import { FormModal } from '../components/FormModal';
import { useHealthData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { Medication, TimeSlot } from '../types';
import { formatDisplayDate, todayISO } from '../utils/dates';
import { DateField } from '../components/DateField';
import { borderRadius, onPrimary, spacing, touchTarget } from '../constants/theme';

const TIME_OPTIONS: TimeSlot[] = ['morning', 'afternoon', 'evening'];

export default function MedicationsScreen() {
  const { colors } = useTheme();
  const {
    getMedications,
    isMedicationTaken,
    toggleMedicationLog,
    addMedication,
    updateMedication,
    deleteMedication,
  } = useHealthData();
  const medications = getMedications();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [selectedTimes, setSelectedTimes] = useState<TimeSlot[]>(['morning']);
  const [inventory, setInventory] = useState('');
  const [logDate, setLogDate] = useState(todayISO());

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDosage('');
    setFrequency('Daily');
    setSelectedTimes(['morning']);
    setInventory('');
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (med: Medication) => {
    setEditingId(med.id);
    setName(med.name);
    setDosage(med.dosage);
    setFrequency(med.frequency);
    setSelectedTimes(med.times);
    setInventory(med.inventory?.toString() ?? '');
    setModalVisible(true);
  };

  const toggleTime = (slot: TimeSlot) => {
    setSelectedTimes((prev) =>
      prev.includes(slot) ? prev.filter((t) => t !== slot) : [...prev, slot],
    );
  };

  const handleSave = async () => {
    if (!name.trim() || !dosage.trim() || selectedTimes.length === 0) return;
    const payload = {
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim() || 'Daily',
      times: selectedTimes,
      inventory: inventory ? parseInt(inventory, 10) : undefined,
    };
    if (editingId) {
      await updateMedication(editingId, payload);
    } else {
      await addMedication(payload);
    }
    resetForm();
    setModalVisible(false);
  };

  const confirmDelete = (med: Medication) => {
    Alert.alert('Delete medication', `Remove ${med.name} from your list?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMedication(med.id),
      },
    ]);
  };

  return (
    <ScreenContainer>
      {medications.length === 0 ? (
        <EmptyState
          title="No medications yet"
          message="Add your supplements and medications to track daily intake."
          action={
            <Button label="Add Medication" onPress={openAddModal} />
          }
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <DateField value={logDate} onChange={setLogDate} label="Log date" />
          {logDate !== todayISO() && (
            <Text style={[styles.dateHint, { color: colors.textSecondary }]}>
              Logging medications for {formatDisplayDate(logDate)}
            </Text>
          )}

          {medications.map((med) => {
            const takenSlots = Object.fromEntries(
              med.times.map((slot) => [slot, isMedicationTaken(med.id, slot, logDate)]),
            ) as Record<TimeSlot, boolean>;
            return (
              <MedicationCard
                key={med.id}
                medication={med}
                takenSlots={takenSlots}
                onToggle={(slot) => toggleMedicationLog(med.id, slot, logDate)}
                onEdit={() => openEditModal(med)}
                onDelete={() => confirmDelete(med)}
              />
            );
          })}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      {medications.length > 0 && (
        <Button label="+ Add" onPress={openAddModal} style={styles.fabFixed} />
      )}

      <FormModal
        visible={modalVisible}
        title={editingId ? 'Edit Medication' : 'Add Medication'}
        onClose={() => {
          resetForm();
          setModalVisible(false);
        }}
        onSave={handleSave}
      >
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Name (e.g. Ferrous Bisglycinate)"
          placeholderTextColor={colors.textSecondary}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Dosage (e.g. 100mg)"
          placeholderTextColor={colors.textSecondary}
          value={dosage}
          onChangeText={setDosage}
        />
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Frequency (e.g. Daily, 2x/day)"
          placeholderTextColor={colors.textSecondary}
          value={frequency}
          onChangeText={setFrequency}
        />
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Time of day</Text>
        <View style={styles.timeRow}>
          {TIME_OPTIONS.map((slot) => (
            <Pressable
              key={slot}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedTimes.includes(slot) }}
              onPress={() => toggleTime(slot)}
              style={({ pressed }) => [
                styles.timeChip,
                {
                  backgroundColor: selectedTimes.includes(slot) ? colors.primary : colors.background,
                  borderColor: colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: selectedTimes.includes(slot) ? onPrimary : colors.text,
                  textTransform: 'capitalize',
                  fontWeight: '600',
                  fontSize: 15,
                }}
              >
                {slot}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Pills remaining (optional)"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          value={inventory}
          onChangeText={setInventory}
        />
      </FormModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  dateHint: { fontSize: 14, marginBottom: spacing.md, marginTop: -spacing.sm },
  fabFixed: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.md,
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 48,
    fontSize: 16,
  },
  fieldLabel: { fontSize: 14, marginBottom: spacing.xs, fontWeight: '600' },
  timeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  timeChip: {
    flex: 1,
    minHeight: touchTarget.minSize,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
});
