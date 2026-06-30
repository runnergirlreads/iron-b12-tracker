import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { Card } from '../components/Card';
import { LabResultRow } from '../components/LabResultRow';
import { EntryActions } from '../components/EntryActions';
import { useHealthData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { DEFAULT_LAB_TESTS } from '../constants/symptoms';
import { LabResult } from '../types';
import { todayISO } from '../utils/dates';
import { spacing } from '../constants/theme';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const {
    profile,
    updateProfile,
    addBaselineLab,
    updateBaselineLab,
    deleteBaselineLab,
  } = useHealthData();

  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age?.toString() ?? '');
  const [gender, setGender] = useState(profile.gender ?? '');
  const [allergies, setAllergies] = useState(profile.allergies ?? '');
  const [conditions, setConditions] = useState(profile.conditions ?? '');

  const [labModalVisible, setLabModalVisible] = useState(false);
  const [editingLabId, setEditingLabId] = useState<string | null>(null);
  const [testName, setTestName] = useState('Ferritin');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('ng/mL');
  const [date, setDate] = useState(todayISO());
  const [refLow, setRefLow] = useState('12');
  const [refHigh, setRefHigh] = useState('150');

  useEffect(() => {
    setName(profile.name);
    setAge(profile.age?.toString() ?? '');
    setGender(profile.gender ?? '');
    setAllergies(profile.allergies ?? '');
    setConditions(profile.conditions ?? '');
  }, [profile]);

  const handleSave = async () => {
    await updateProfile({
      ...profile,
      name: name.trim(),
      age: age ? parseInt(age, 10) : undefined,
      gender: gender.trim() || undefined,
      allergies: allergies.trim() || undefined,
      conditions: conditions.trim() || undefined,
    });
    Alert.alert('Saved', 'Profile updated.');
  };

  const resetLabForm = () => {
    setEditingLabId(null);
    setTestName('Ferritin');
    setValue('');
    setUnit('ng/mL');
    setDate(todayISO());
    setRefLow('12');
    setRefHigh('150');
  };

  const selectPreset = (preset: (typeof DEFAULT_LAB_TESTS)[0]) => {
    setTestName(preset.name);
    setUnit(preset.unit);
    setRefLow(String(preset.refLow));
    setRefHigh(String(preset.refHigh));
  };

  const openAddLabModal = () => {
    resetLabForm();
    setLabModalVisible(true);
  };

  const openEditLabModal = (lab: LabResult) => {
    setEditingLabId(lab.id);
    setTestName(lab.testName);
    setValue(String(lab.value));
    setUnit(lab.unit);
    setDate(lab.date);
    setRefLow(lab.refLow != null ? String(lab.refLow) : '');
    setRefHigh(lab.refHigh != null ? String(lab.refHigh) : '');
    setLabModalVisible(true);
  };

  const handleSaveLab = async () => {
    const numValue = parseFloat(value);
    if (!testName.trim() || isNaN(numValue)) return;
    const payload = {
      testName: testName.trim(),
      value: numValue,
      unit: unit.trim(),
      date,
      refLow: refLow ? parseFloat(refLow) : undefined,
      refHigh: refHigh ? parseFloat(refHigh) : undefined,
    };
    if (editingLabId) {
      await updateBaselineLab(editingLabId, payload);
    } else {
      await addBaselineLab(payload);
    }
    resetLabForm();
    setLabModalVisible(false);
  };

  const confirmDeleteLab = (lab: LabResult) => {
    Alert.alert('Delete baseline lab', `Remove ${lab.testName} baseline?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteBaselineLab(lab.id) },
    ]);
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.section, { color: colors.text }]}>Personal Info</Text>
        <Card>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={[styles.label, { color: colors.textSecondary }]}>Age</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            placeholder="Age"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={[styles.label, { color: colors.textSecondary }]}>Gender</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            value={gender}
            onChangeText={setGender}
            placeholder="Gender"
            placeholderTextColor={colors.textSecondary}
          />
        </Card>

        <Text style={[styles.section, { color: colors.text }]}>Health Info</Text>
        <Card>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Allergies</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            value={allergies}
            onChangeText={setAllergies}
            placeholder="Optional"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={[styles.label, { color: colors.textSecondary }]}>Conditions</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            value={conditions}
            onChangeText={setConditions}
            placeholder="Optional"
            placeholderTextColor={colors.textSecondary}
          />
        </Card>

        <View style={styles.sectionRow}>
          <Text style={[styles.section, { color: colors.text, marginTop: 0 }]}>Baseline Labs</Text>
          <Pressable onPress={openAddLabModal}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>+ Add</Text>
          </Pressable>
        </View>
        <Card>
          {profile.baselineLabs.length === 0 ? (
            <Text style={{ color: colors.textSecondary }}>
              Record starting ferritin, B12, HGB values with dates
            </Text>
          ) : (
            profile.baselineLabs.map((lab, i) => (
              <View key={lab.id}>
                <LabResultRow result={lab} />
                <EntryActions
                  onEdit={() => openEditLabModal(lab)}
                  onDelete={() => confirmDeleteLab(lab)}
                />
                {i < profile.baselineLabs.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border, marginTop: spacing.sm }]} />
                )}
              </View>
            ))
          )}
        </Card>

        <Text style={[styles.section, { color: colors.text }]}>Current Medications</Text>
        <Card>
          {profile.medications.length === 0 ? (
            <Text style={{ color: colors.textSecondary }}>Add medications from the Medications tab</Text>
          ) : (
            profile.medications.map((m) => (
              <View key={m.id} style={styles.medItem}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>{m.name}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                  {m.dosage} · {m.frequency}
                </Text>
              </View>
            ))
          )}
        </Card>

        <Pressable style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Profile</Text>
        </Pressable>
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <Modal visible={labModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={[styles.modal, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingLabId ? 'Edit Baseline Lab' : 'Add Baseline Lab'}
            </Text>
            <View style={styles.presetRow}>
              {DEFAULT_LAB_TESTS.map((p) => (
                <Pressable
                  key={p.name}
                  onPress={() => selectPreset(p)}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: testName === p.name ? colors.primary : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: testName === p.name ? '#fff' : colors.text, fontSize: 13 }}>
                    {p.name}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Test name"
              placeholderTextColor={colors.textSecondary}
              value={testName}
              onChangeText={setTestName}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Value"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              value={value}
              onChangeText={setValue}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Unit"
              placeholderTextColor={colors.textSecondary}
              value={unit}
              onChangeText={setUnit}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor={colors.textSecondary}
              value={date}
              onChangeText={setDate}
            />
            <View style={styles.refRow}>
              <TextInput
                style={[styles.input, styles.refInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="Ref low"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
                value={refLow}
                onChangeText={setRefLow}
              />
              <TextInput
                style={[styles.input, styles.refInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="Ref high"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
                value={refHigh}
                onChangeText={setRefHigh}
              />
            </View>
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  resetLabForm();
                  setLabModalVisible(false);
                }}
              >
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSaveLab}>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>Save</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 18, fontWeight: '600', marginTop: spacing.md, marginBottom: spacing.sm },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  label: { fontSize: 13, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 8, padding: spacing.sm, marginBottom: spacing.sm },
  medItem: { marginBottom: spacing.sm },
  divider: { height: 1 },
  saveBtn: { padding: spacing.md, borderRadius: 10, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg, maxHeight: '85%' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: spacing.md },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  presetChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  refRow: { flexDirection: 'row', gap: spacing.sm },
  refInput: { flex: 1 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.lg, marginBottom: spacing.lg },
});
