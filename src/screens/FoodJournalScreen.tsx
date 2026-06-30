import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { EntryActions } from '../components/EntryActions';
import { Button } from '../components/Button';
import { DateField } from '../components/DateField';
import { MealPicker, MEAL_OPTIONS, MealOption } from '../components/MealPicker';
import { FormModal } from '../components/FormModal';
import { useHealthData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { FoodEntry } from '../types';
import { formatDisplayDate, isValidISODate, todayISO } from '../utils/dates';
import { borderRadius, spacing } from '../constants/theme';

export default function FoodJournalScreen() {
  const { colors } = useTheme();
  const { food, addFoodEntry, updateFoodEntry, deleteFoodEntry } = useHealthData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [meal, setMeal] = useState<MealOption | ''>('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(todayISO());

  const sorted = [...food].sort((a, b) => b.date.localeCompare(a.date));

  const resetForm = () => {
    setEditingId(null);
    setMeal('');
    setNotes('');
    setDate(todayISO());
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (entry: FoodEntry) => {
    setEditingId(entry.id);
    const savedMeal = MEAL_OPTIONS.includes(entry.meal as MealOption)
      ? (entry.meal as MealOption)
      : '';
    setMeal(savedMeal);
    setNotes(entry.notes);
    setDate(entry.date);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!meal) {
      Alert.alert('Select a meal', 'Choose Breakfast, Lunch, Dinner, or Snack.');
      return;
    }
    if (!isValidISODate(date)) {
      Alert.alert('Invalid date', 'Please enter a valid date.');
      return;
    }
    const payload = { date, meal, notes: notes.trim() };
    if (editingId) {
      await updateFoodEntry(editingId, payload);
    } else {
      await addFoodEntry(payload);
    }
    resetForm();
    setModalVisible(false);
  };

  const confirmDelete = (entry: FoodEntry) => {
    Alert.alert('Delete entry', `Remove "${entry.meal}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteFoodEntry(entry.id) },
    ]);
  };

  return (
    <ScreenContainer>
      {sorted.length === 0 ? (
        <EmptyState
          title="No food entries"
          message="Track meals and how they affect your symptoms."
          action={<Button label="Add Entry" onPress={openAddModal} />}
        />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Card>
              <Text style={[styles.meal, { color: colors.text }]}>{item.meal}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                {formatDisplayDate(item.date)}
              </Text>
              {item.notes ? (
                <Text style={[styles.notes, { color: colors.textSecondary }]}>{item.notes}</Text>
              ) : null}
              <EntryActions onEdit={() => openEditModal(item)} onDelete={() => confirmDelete(item)} />
            </Card>
          )}
        />
      )}

      {sorted.length > 0 && (
        <Button label="+ Add" onPress={openAddModal} style={styles.fab} />
      )}

      <FormModal
        visible={modalVisible}
        title={editingId ? 'Edit Food Entry' : 'Add Food Entry'}
        onClose={() => {
          resetForm();
          setModalVisible(false);
        }}
        onSave={handleSave}
      >
        <DateField value={date} onChange={setDate} />
        <MealPicker
          value={meal}
          onChange={setMeal}
        />
        <TextInput
          style={[styles.input, styles.notesInput, { color: colors.text, borderColor: colors.border }]}
          placeholder="Notes (e.g. Ate iron-rich foods)"
          placeholderTextColor={colors.textSecondary}
          multiline
          value={notes}
          onChangeText={setNotes}
        />
      </FormModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  meal: { fontSize: 17, fontWeight: '600', marginBottom: 2 },
  notes: { fontSize: 14, marginTop: spacing.sm, lineHeight: 20 },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.md,
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 48,
    fontSize: 16,
  },
  notesInput: { minHeight: 100, textAlignVertical: 'top' },
});
