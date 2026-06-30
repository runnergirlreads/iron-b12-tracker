import React, { useMemo, useState } from 'react';
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
import { Card } from '../components/Card';
import { LabResultRow } from '../components/LabResultRow';
import { LabTrendChart } from '../components/LabTrendChart';
import { LabAttachmentViewer } from '../components/LabAttachmentViewer';
import { EmptyState } from '../components/EmptyState';
import { EntryActions } from '../components/EntryActions';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { DateField } from '../components/DateField';
import { FormModal } from '../components/FormModal';
import { useHealthData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { DEFAULT_LAB_TESTS } from '../constants/symptoms';
import {
  deleteLabAttachment,
  persistLabAttachment,
  pickLabImage,
  pickLabPdf,
} from '../services/labAttachments';
import { LabResult } from '../types';
import { todayISO, isValidISODate } from '../utils/dates';
import {
  buildCustomLabTestNames,
  getDefaultLabTestNames,
  getLabTestPreset,
  isDefaultLabTest,
} from '../utils/labTests';
import { borderRadius, spacing, touchTarget } from '../constants/theme';

interface PendingAttachment {
  uri: string;
  mimeType?: string;
  name?: string;
}

export default function LabResultsScreen() {
  const { colors } = useTheme();
  const { labs, customLabTests, addLabResult, updateLabResult, deleteLabResult } = useHealthData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [showMoreTests, setShowMoreTests] = useState(false);
  const [viewerLab, setViewerLab] = useState<LabResult | null>(null);

  const [testName, setTestName] = useState('Ferritin');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('ng/mL');
  const [date, setDate] = useState(todayISO());
  const [refLow, setRefLow] = useState('12');
  const [refHigh, setRefHigh] = useState('150');
  const [customTest, setCustomTest] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);

  const sortedLabs = useMemo(
    () => [...labs].sort((a, b) => b.date.localeCompare(a.date)),
    [labs],
  );

  const defaultTestNames = useMemo(() => getDefaultLabTestNames(), []);
  const customTestNames = useMemo(
    () => buildCustomLabTestNames(customLabTests, labs),
    [customLabTests, labs],
  );

  const chartTest = selectedTest ?? defaultTestNames[0];
  const editingLab = editingId ? labs.find((l) => l.id === editingId) : undefined;

  const selectTrendTest = (name: string) => {
    setSelectedTest(name);
    if (!isDefaultLabTest(name)) {
      setShowMoreTests(true);
    }
  };

  const selectSavedCustomTest = (name: string) => {
    const preset = getLabTestPreset(name, customLabTests);
    setTestName(name);
    setCustomTest(true);
    if (preset) {
      setUnit(preset.unit);
      setRefLow(preset.refLow != null ? String(preset.refLow) : '');
      setRefHigh(preset.refHigh != null ? String(preset.refHigh) : '');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTestName('Ferritin');
    setValue('');
    setUnit('ng/mL');
    setDate(todayISO());
    setRefLow('12');
    setRefHigh('150');
    setCustomTest(false);
    setPendingAttachment(null);
    setRemoveAttachment(false);
  };

  const selectPreset = (preset: (typeof DEFAULT_LAB_TESTS)[0]) => {
    setTestName(preset.name);
    setUnit(preset.unit);
    setRefLow(String(preset.refLow));
    setRefHigh(String(preset.refHigh));
    setCustomTest(false);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (lab: LabResult) => {
    setEditingId(lab.id);
    setTestName(lab.testName);
    setValue(String(lab.value));
    setUnit(lab.unit);
    setDate(lab.date);
    setRefLow(lab.refLow != null ? String(lab.refLow) : '');
    setRefHigh(lab.refHigh != null ? String(lab.refHigh) : '');
    setCustomTest(!DEFAULT_LAB_TESTS.some((p) => p.name === lab.testName));
    setPendingAttachment(null);
    setRemoveAttachment(false);
    setModalVisible(true);
  };

  const handlePickImage = async () => {
    try {
      const picked = await pickLabImage();
      if (picked) {
        setPendingAttachment(picked);
        setRemoveAttachment(false);
      }
    } catch (err) {
      Alert.alert('Could not attach photo', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handlePickPdf = async () => {
    try {
      const picked = await pickLabPdf();
      if (picked) {
        setPendingAttachment(picked);
        setRemoveAttachment(false);
      }
    } catch (err) {
      Alert.alert('Could not attach PDF', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleSave = async () => {
    const numValue = parseFloat(value);
    if (!testName.trim() || isNaN(numValue)) return;
    if (!isValidISODate(date)) {
      Alert.alert('Invalid date', 'Please enter a valid date.');
      return;
    }

    const basePayload = {
      testName: testName.trim(),
      value: numValue,
      unit: unit.trim(),
      date,
      refLow: refLow ? parseFloat(refLow) : undefined,
      refHigh: refHigh ? parseFloat(refHigh) : undefined,
    };

    let labId = editingId;
    const previousAttachmentUri = editingLab?.attachmentUri;

    if (editingId) {
      await updateLabResult(editingId, {
        ...basePayload,
        attachmentUri: removeAttachment ? undefined : editingLab?.attachmentUri,
        attachmentName: removeAttachment ? undefined : editingLab?.attachmentName,
        attachmentKind: removeAttachment ? undefined : editingLab?.attachmentKind,
      });
    } else {
      labId = await addLabResult(basePayload);
    }

    if (labId && pendingAttachment) {
      const saved = await persistLabAttachment(
        labId,
        pendingAttachment.uri,
        pendingAttachment.mimeType,
        pendingAttachment.name,
      );
      await updateLabResult(labId, { ...basePayload, ...saved });
      if (previousAttachmentUri && previousAttachmentUri !== saved.attachmentUri) {
        deleteLabAttachment(previousAttachmentUri);
      }
    } else if (editingId && removeAttachment && previousAttachmentUri) {
      deleteLabAttachment(previousAttachmentUri);
    }

    resetForm();
    setModalVisible(false);
  };

  const confirmDelete = (lab: LabResult) => {
    Alert.alert('Delete lab result', `Remove ${lab.testName} result from ${lab.date}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteLabResult(lab.id),
      },
    ]);
  };

  const attachmentLabel =
    pendingAttachment?.name ??
    (!removeAttachment ? editingLab?.attachmentName : undefined);

  return (
    <ScreenContainer>
      {labs.length === 0 ? (
        <EmptyState
          title="No lab results"
          message="Track ferritin, B12, HGB and more to see trends over time."
          action={
            <Button label="Add Lab Result" onPress={openAddModal} />
          }
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.xs }]}>Trends</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testScroll}>
            {defaultTestNames.map((name) => (
              <Chip
                key={name}
                label={name}
                selected={chartTest === name}
                onPress={() => selectTrendTest(name)}
              />
            ))}
            <Chip
              label="More"
              selected={showMoreTests}
              onPress={() => setShowMoreTests((prev) => !prev)}
            />
          </ScrollView>

          {showMoreTests && (
            <View style={styles.moreSection}>
              <Text style={[styles.moreLabel, { color: colors.textSecondary }]}>Custom tests</Text>
              {customTestNames.length === 0 ? (
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  No custom tests yet. Add a custom result to save it here.
                </Text>
              ) : (
                <View style={styles.moreChipRow}>
                  {customTestNames.map((name) => (
                    <Chip
                      key={name}
                      label={name}
                      selected={chartTest === name}
                      onPress={() => selectTrendTest(name)}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          <Card>
            <LabTrendChart results={labs} testName={chartTest} />
          </Card>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>All Results</Text>
          <Card>
            {sortedLabs.map((lab, i) => (
              <View key={lab.id}>
                <LabResultRow
                  result={lab}
                  selected={selectedTest === lab.testName}
                  onPress={() => selectTrendTest(lab.testName)}
                  onAttachmentPress={() => setViewerLab(lab)}
                />
                <EntryActions
                  onEdit={() => openEditModal(lab)}
                  onDelete={() => confirmDelete(lab)}
                />
                {i < sortedLabs.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border, marginTop: spacing.sm }]} />
                )}
              </View>
            ))}
          </Card>
          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      <Button label="+ Add" onPress={openAddModal} style={styles.fab} />

      <LabAttachmentViewer
        lab={viewerLab}
        visible={viewerLab != null}
        onClose={() => setViewerLab(null)}
      />

      <FormModal
        visible={modalVisible}
        title={editingId ? 'Edit Lab Result' : 'Add Lab Result'}
        onClose={() => {
          resetForm();
          setModalVisible(false);
        }}
        onSave={handleSave}
      >
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Test</Text>
        <View style={styles.presetRow}>
          {DEFAULT_LAB_TESTS.map((p) => (
            <Pressable
              key={p.name}
              onPress={() => selectPreset(p)}
              style={({ pressed }) => [
                styles.presetChip,
                {
                  backgroundColor: testName === p.name && !customTest ? colors.primary : colors.background,
                  borderColor: colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={{ color: testName === p.name && !customTest ? '#fff' : colors.text, fontSize: 14 }}>
                {p.name}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => setCustomTest(true)}
            style={({ pressed }) => [
              styles.presetChip,
              {
                backgroundColor: customTest ? colors.primary : colors.background,
                borderColor: colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={{ color: customTest ? '#fff' : colors.text, fontSize: 14 }}>Custom</Text>
          </Pressable>
        </View>

        {(customTest || !DEFAULT_LAB_TESTS.some((p) => p.name === testName)) && (
          <>
            {customTestNames.length > 0 && (
              <>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Saved custom tests</Text>
                <View style={styles.moreChipRow}>
                  {customTestNames.map((name) => (
                    <Chip
                      key={name}
                      label={name}
                      selected={testName === name}
                      onPress={() => selectSavedCustomTest(name)}
                    />
                  ))}
                </View>
              </>
            )}
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Test name"
              placeholderTextColor={colors.textSecondary}
              value={testName}
              onChangeText={setTestName}
            />
          </>
        )}

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
          placeholder="Unit (e.g. ng/mL)"
          placeholderTextColor={colors.textSecondary}
          value={unit}
          onChangeText={setUnit}
        />
        <DateField value={date} onChange={setDate} />
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

        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Lab report attachment</Text>
        <View style={styles.attachRow}>
          <Button label="Photo" variant="secondary" onPress={handlePickImage} style={styles.attachOption} />
          <Button label="PDF" variant="secondary" onPress={handlePickPdf} style={styles.attachOption} />
        </View>
        {attachmentLabel && (
          <View style={[styles.attachmentInfo, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={{ color: colors.text, flex: 1 }} numberOfLines={1}>
              {attachmentLabel}
            </Text>
            <Button
              label="Remove"
              variant="ghost"
              onPress={() => {
                setPendingAttachment(null);
                setRemoveAttachment(true);
              }}
              labelStyle={{ color: colors.danger }}
            />
          </View>
        )}
      </FormModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.sm },
  testScroll: { marginBottom: spacing.xs },
  moreSection: { marginBottom: spacing.md },
  moreLabel: { fontSize: 13, fontWeight: '600', marginBottom: spacing.sm },
  moreChipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  divider: { height: 1 },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.md,
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
  },
  fieldLabel: { fontSize: 14, marginBottom: spacing.xs, marginTop: spacing.xs, fontWeight: '600' },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  presetChip: {
    minHeight: touchTarget.minSize,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 48,
    fontSize: 16,
  },
  refRow: { flexDirection: 'row', gap: spacing.sm },
  refInput: { flex: 1 },
  attachRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  attachOption: { flex: 1 },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
});
