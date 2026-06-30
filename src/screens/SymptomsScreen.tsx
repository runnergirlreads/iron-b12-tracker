import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HeaderButton } from '@react-navigation/elements';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { Card } from '../components/Card';
import { SeveritySlider } from '../components/SeveritySlider';
import { YesNoToggle } from '../components/YesNoToggle';
import { FlowPicker } from '../components/FlowPicker';
import { DateField } from '../components/DateField';
import { Button } from '../components/Button';
import { FormModal } from '../components/FormModal';
import { KeyboardAwareScrollView } from '../components/KeyboardAwareScrollView';
import { useHealthData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { PREDEFINED_SYMPTOMS } from '../constants/symptoms';
import { SymptomsStackParamList } from '../navigation/types';
import { FlowLevel, SymptomEntry } from '../types';
import { formatDisplayDate, generateId, isValidISODate, todayISO } from '../utils/dates';
import { borderRadius, spacing, touchTarget } from '../constants/theme';

type Nav = NativeStackNavigationProp<SymptomsStackParamList, 'SymptomsMain'>;

interface SymptomDraft {
  severity?: number;
  yesNo?: boolean;
  location?: string;
  flow?: FlowLevel;
  enabled: boolean;
}

export default function SymptomsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const { symptoms, saveSymptomEntries } = useHealthData();
  const [selectedDate, setSelectedDate] = useState(todayISO());

  const [drafts, setDrafts] = useState<Record<string, SymptomDraft>>({});
  const [dayNotes, setDayNotes] = useState('');
  const [customModal, setCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customSymptoms, setCustomSymptoms] = useState<{ id: string; label: string }[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton
          onPress={() => navigation.navigate('SymptomTrends')}
          accessibilityLabel="Trends"
        >
          <Text style={[styles.headerTrendsLabel, { color: colors.primary }]}>Trends</Text>
        </HeaderButton>
      ),
    });
  }, [navigation, colors.primary]);

  useEffect(() => {
    const dayEntries = symptoms.filter((s) => s.date === selectedDate);
    const initial: Record<string, SymptomDraft> = {};
    const customs: { id: string; label: string }[] = [];
    let notes = '';

    for (const entry of dayEntries) {
      const isPredefined = PREDEFINED_SYMPTOMS.some((s) => s.id === entry.symptom);
      if (!isPredefined) {
        customs.push({ id: entry.symptom, label: entry.symptom });
      }
      initial[entry.symptom] = {
        enabled: true,
        severity: entry.severity,
        yesNo: entry.yesNo,
        location: entry.location,
        flow: entry.flow,
      };
      if (entry.notes) notes = entry.notes;
    }
    setCustomSymptoms(customs);
    setDrafts(initial);
    setDayNotes(notes);
  }, [symptoms, selectedDate]);

  const updateDraft = (id: string, patch: Partial<SymptomDraft>) => {
    setDrafts((prev) => {
      const current = prev[id] ?? { enabled: false, severity: 5 };
      return { ...prev, [id]: { ...current, ...patch } };
    });
  };

  const handleSave = async () => {
    if (!isValidISODate(selectedDate)) {
      Alert.alert('Invalid date', 'Please enter a valid date before saving.');
      return;
    }

    const entries: SymptomEntry[] = [];
    const allSymptoms = [
      ...PREDEFINED_SYMPTOMS,
      ...customSymptoms.map((c) => ({ id: c.id, label: c.label, inputType: 'slider' as const })),
    ];

    for (const def of allSymptoms) {
      const draft = drafts[def.id];
      if (!draft?.enabled) continue;

      const entry: SymptomEntry = {
        id: generateId(),
        date: selectedDate,
        symptom: def.id,
      };

      if (draft.severity != null) entry.severity = draft.severity;
      if (draft.yesNo != null) entry.yesNo = draft.yesNo;
      if (draft.location) entry.location = draft.location;
      if (draft.flow) entry.flow = draft.flow;

      entries.push(entry);
    }

    await saveSymptomEntries(entries, selectedDate, dayNotes || undefined);
    const label =
      selectedDate === todayISO() ? 'today' : formatDisplayDate(selectedDate);
    Alert.alert('Saved', `Symptoms for ${label} have been logged.`);
  };

  const addCustomSymptom = () => {
    if (!customName.trim()) return;
    const id = customName.trim().toLowerCase().replace(/\s+/g, '_');
    setCustomSymptoms((prev) => [...prev, { id, label: customName.trim() }]);
    setDrafts((prev) => ({ ...prev, [id]: { enabled: true, severity: 5 } }));
    setCustomName('');
    setCustomModal(false);
  };

  const renderSymptomInput = (
    def: (typeof PREDEFINED_SYMPTOMS)[0] | { id: string; label: string; inputType: 'slider' },
  ) => {
    const draft = drafts[def.id] ?? { enabled: false, severity: 5 };

    return (
      <Card key={def.id}>
        <Pressable
          onPress={() => updateDraft(def.id, { enabled: !draft.enabled })}
          style={styles.symptomHeaderPress}
          accessibilityRole="switch"
          accessibilityState={{ checked: draft.enabled }}
        >
          <View style={styles.symptomHeader}>
            <Text style={[styles.symptomLabel, { color: colors.text }]}>{def.label}</Text>
            <View style={[styles.toggle, { backgroundColor: draft.enabled ? colors.primary : colors.border }]}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                {draft.enabled ? 'ON' : 'OFF'}
              </Text>
            </View>
          </View>
        </Pressable>
        {draft.enabled && (
          <View style={styles.inputs}>
            {def.inputType === 'slider' && (
              <SeveritySlider
                value={draft.severity ?? 5}
                onChange={(v) => updateDraft(def.id, { severity: v })}
              />
            )}
            {def.inputType === 'yesNo' && (
              <YesNoToggle value={draft.yesNo} onChange={(v) => updateDraft(def.id, { yesNo: v })} />
            )}
            {def.inputType === 'yesNoLocation' && (
              <>
                <YesNoToggle value={draft.yesNo} onChange={(v) => updateDraft(def.id, { yesNo: v })} />
                {draft.yesNo && (
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
                    ]}
                    placeholder="Location (e.g. hands, feet)"
                    placeholderTextColor={colors.textSecondary}
                    value={draft.location ?? ''}
                    onChangeText={(t) => updateDraft(def.id, { location: t })}
                  />
                )}
              </>
            )}
            {def.inputType === 'yesNoSeverity' && (
              <>
                <YesNoToggle value={draft.yesNo} onChange={(v) => updateDraft(def.id, { yesNo: v })} />
                {draft.yesNo && (
                  <SeveritySlider
                    label="Severity"
                    value={draft.severity ?? 5}
                    onChange={(v) => updateDraft(def.id, { severity: v })}
                  />
                )}
              </>
            )}
            {def.inputType === 'yesNoFlow' && (
              <>
                <YesNoToggle value={draft.yesNo} onChange={(v) => updateDraft(def.id, { yesNo: v })} />
                {draft.yesNo && (
                  <FlowPicker value={draft.flow} onChange={(v) => updateDraft(def.id, { flow: v })} />
                )}
              </>
            )}
          </View>
        )}
      </Card>
    );
  };

  const isToday = selectedDate === todayISO();

  return (
    <ScreenContainer>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <DateField value={selectedDate} onChange={setSelectedDate} label="Log date" />

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isToday ? "Log how you're feeling today" : `Log symptoms for ${formatDisplayDate(selectedDate)}`}
        </Text>

        {PREDEFINED_SYMPTOMS.map(renderSymptomInput)}
        {customSymptoms.map((c) => renderSymptomInput({ ...c, inputType: 'slider' }))}

        <Button
          label="+ Add custom symptom"
          variant="secondary"
          onPress={() => setCustomModal(true)}
          style={styles.addCustom}
        />

        <Text style={[styles.notesLabel, { color: colors.text }]}>Notes</Text>
        <TextInput
          style={[
            styles.notesInput,
            { color: colors.text, borderColor: colors.border, backgroundColor: colors.card },
          ]}
          placeholder="e.g. Took iron on empty stomach, felt nauseous"
          placeholderTextColor={colors.textSecondary}
          multiline
          value={dayNotes}
          onChangeText={setDayNotes}
        />

        <Button
          label={isToday ? "Save Today's Log" : 'Save Log'}
          onPress={handleSave}
          style={styles.saveBtn}
        />
        <View style={{ height: spacing.xl }} />
      </KeyboardAwareScrollView>

      <FormModal
        visible={customModal}
        title="Add Custom Symptom"
        onClose={() => setCustomModal(false)}
        onSave={addCustomSymptom}
        saveLabel="Add"
      >
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholder="Symptom name"
          placeholderTextColor={colors.textSecondary}
          value={customName}
          onChangeText={setCustomName}
          autoFocus
        />
      </FormModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerTrendsLabel: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: { fontSize: 14, marginBottom: spacing.md },
  symptomHeaderPress: { minHeight: touchTarget.minSize, justifyContent: 'center' },
  symptomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  symptomLabel: { fontSize: 16, fontWeight: '600' },
  toggle: {
    minWidth: touchTarget.minSize,
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputs: { marginTop: spacing.sm },
  addCustom: { marginBottom: spacing.md, borderStyle: 'dashed' },
  notesLabel: { fontSize: 16, fontWeight: '600', marginBottom: spacing.sm },
  notesInput: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
    fontSize: 16,
  },
  saveBtn: { marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
    minHeight: touchTarget.minSize,
    fontSize: 16,
  },
});
