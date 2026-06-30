import React, { useMemo, useState } from 'react';
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
import { FormModal } from '../components/FormModal';
import { useHealthData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { Note } from '../types';
import { formatDisplayDate, isValidISODate, todayISO } from '../utils/dates';
import { borderRadius, spacing, touchTarget } from '../constants/theme';

export default function NotesScreen() {
  const { colors } = useTheme();
  const { notes, addNote, updateNote, deleteNote } = useHealthData();
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [date, setDate] = useState(todayISO());

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const sorted = [...notes].sort((a, b) => b.date.localeCompare(a.date));
    if (!q) return sorted;
    return sorted.filter(
      (n) =>
        n.text.toLowerCase().includes(q) ||
        n.tags.some((t) => t.includes(q.replace('#', ''))),
    );
  }, [notes, search]);

  const resetForm = () => {
    setEditingId(null);
    setText('');
    setDate(todayISO());
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (note: Note) => {
    setEditingId(note.id);
    setText(note.text);
    setDate(note.date);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!text.trim()) return;
    if (!isValidISODate(date)) {
      Alert.alert('Invalid date', 'Please enter a valid date.');
      return;
    }
    if (editingId) {
      await updateNote(editingId, text.trim(), date);
    } else {
      await addNote(text.trim(), date);
    }
    resetForm();
    setModalVisible(false);
  };

  const confirmDelete = (note: Note) => {
    Alert.alert('Delete note', 'Remove this journal entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteNote(note.id) },
    ]);
  };

  return (
    <ScreenContainer>
      <TextInput
        style={[styles.search, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
        placeholder="Search notes or #tags"
        placeholderTextColor={colors.textSecondary}
        value={search}
        onChangeText={setSearch}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title={search ? 'No matching notes' : 'No notes yet'}
          message="Write observations like how you felt after taking iron. Use #tags to organize."
          action={
            !search ? (
              <Button label="Write Note" onPress={openAddModal} />
            ) : undefined
          }
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Card>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>
                {formatDisplayDate(item.date)}
              </Text>
              <Text style={[styles.noteText, { color: colors.text }]}>{item.text}</Text>
              {item.tags.length > 0 && (
                <View style={styles.tagRow}>
                  {item.tags.map((tag) => (
                    <View key={tag} style={[styles.tag, { backgroundColor: colors.primary + '22' }]}>
                      <Text style={{ color: colors.primary, fontSize: 12 }}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
              <EntryActions onEdit={() => openEditModal(item)} onDelete={() => confirmDelete(item)} />
            </Card>
          )}
        />
      )}

      {filtered.length > 0 && (
        <Button label="+ Note" onPress={openAddModal} style={styles.fab} />
      )}

      <FormModal
        visible={modalVisible}
        title={editingId ? 'Edit Note' : 'New Note'}
        onClose={() => {
          resetForm();
          setModalVisible(false);
        }}
        onSave={handleSave}
      >
        <DateField value={date} onChange={setDate} />
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="e.g. Felt more energized after iron dose #fatigue #iron"
          placeholderTextColor={colors.textSecondary}
          multiline
          value={text}
          onChangeText={setText}
        />
      </FormModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  search: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
    minHeight: touchTarget.minSize,
    fontSize: 16,
  },
  noteText: { fontSize: 15, lineHeight: 22 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, minHeight: 28 },
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
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
  },
});
