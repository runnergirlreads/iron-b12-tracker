import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { ScreenContainer } from '../components/ScreenContainer';
import { FlowPicker } from '../components/FlowPicker';
import { EntryActions } from '../components/EntryActions';
import { Button } from '../components/Button';
import { DateField } from '../components/DateField';
import { FormModal } from '../components/FormModal';
import { useHealthData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { PERIOD_SYMPTOM_OPTIONS } from '../constants/symptoms';
import { FlowLevel, PeriodEntry } from '../types';
import { formatDisplayDate, isValidISODate, todayISO } from '../utils/dates';
import {
  eachDateInRange,
  findPeriodForDate,
  formatPeriodSymptomSummary,
  getDaySymptoms,
  getPeriodEndDate,
  hasDaySymptoms,
} from '../utils/periodDays';
import { getPeriodDatesForCalendar, predictNextPeriod } from '../utils/periodPrediction';
import { borderRadius, onPrimary, spacing, touchTarget } from '../constants/theme';

export default function PeriodTrackerScreen() {
  const { colors } = useTheme();
  const { periods, addPeriod, updatePeriod, updatePeriodDaySymptoms, deletePeriod } = useHealthData();

  const [periodModalVisible, setPeriodModalVisible] = useState(false);
  const [dayModalVisible, setDayModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dayPeriodId, setDayPeriodId] = useState<string | null>(null);
  const [dayDate, setDayDate] = useState(todayISO());

  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState('');
  const [flow, setFlow] = useState<FlowLevel>('medium');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const markedDates = useMemo(() => {
    const marked = getPeriodDatesForCalendar(periods, colors.periodFlow, colors.text);

    for (const period of periods) {
      for (const date of eachDateInRange(period.startDate, getPeriodEndDate(period))) {
        if (hasDaySymptoms(period, date) && marked[date]) {
          marked[date] = {
            ...marked[date],
            customStyles: {
              ...marked[date].customStyles,
              container: {
                ...marked[date].customStyles.container,
                borderWidth: 2,
                borderColor: colors.primary,
              },
            },
          };
        }
      }
    }

    return marked;
  }, [periods, colors.primary, colors.periodFlow, colors.text]);

  const nextPeriod = useMemo(() => predictNextPeriod(periods), [periods]);
  const dayPeriod = dayPeriodId ? periods.find((p) => p.id === dayPeriodId) : undefined;

  const resetPeriodForm = () => {
    setEditingId(null);
    setStartDate(todayISO());
    setEndDate('');
    setFlow('medium');
  };

  const openAddPeriodModal = () => {
    resetPeriodForm();
    setPeriodModalVisible(true);
  };

  const openEditPeriodModal = (period: PeriodEntry) => {
    setEditingId(period.id);
    setStartDate(period.startDate);
    setEndDate(period.endDate ?? '');
    setFlow(period.flow);
    setPeriodModalVisible(true);
  };

  const openDaySymptomsModal = (date: string, period: PeriodEntry) => {
    setDayPeriodId(period.id);
    setDayDate(date);
    setSelectedSymptoms(getDaySymptoms(period, date));
    setDayModalVisible(true);
  };

  const handleDayPress = (day: DateData) => {
    const period = findPeriodForDate(periods, day.dateString);
    if (period) {
      openDaySymptomsModal(day.dateString, period);
      return;
    }

    Alert.alert(
      'No period on this day',
      'Log a period range first, then tap individual days to record symptoms.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log period',
          onPress: () => {
            resetPeriodForm();
            setStartDate(day.dateString);
            setPeriodModalVisible(true);
          },
        },
      ],
    );
  };

  const handleSavePeriod = async () => {
    if (!isValidISODate(startDate)) {
      Alert.alert('Invalid date', 'Please enter a valid start date.');
      return;
    }
    if (endDate && !isValidISODate(endDate)) {
      Alert.alert('Invalid date', 'Please enter a valid end date.');
      return;
    }
    if (endDate && endDate < startDate) {
      Alert.alert('Invalid range', 'End date must be on or after the start date.');
      return;
    }

    const existing = editingId ? periods.find((p) => p.id === editingId) : undefined;
    const payload = {
      startDate,
      endDate: endDate || undefined,
      flow,
      symptoms: [] as string[],
      daySymptoms: existing?.daySymptoms ?? {},
    };

    if (editingId) {
      await updatePeriod(editingId, payload);
    } else {
      await addPeriod(payload);
    }
    resetPeriodForm();
    setPeriodModalVisible(false);
  };

  const handleSaveDaySymptoms = async () => {
    if (!dayPeriodId) return;
    await updatePeriodDaySymptoms(dayPeriodId, dayDate, selectedSymptoms);
    setDayModalVisible(false);
    setDayPeriodId(null);
    setSelectedSymptoms([]);
  };

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const confirmDelete = (period: PeriodEntry) => {
    Alert.alert('Delete period', 'Remove this period entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePeriod(period.id) },
    ]);
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Tap a highlighted day to log symptoms for that date only.
        </Text>

        <Calendar
          markedDates={markedDates}
          markingType="custom"
          onDayPress={handleDayPress}
          theme={{
            backgroundColor: colors.background,
            calendarBackground: colors.card,
            textSectionTitleColor: colors.textSecondary,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: '#fff',
            todayTextColor: colors.primary,
            dayTextColor: colors.text,
            monthTextColor: colors.text,
            arrowColor: colors.primary,
          }}
          style={[styles.calendar, { borderColor: colors.border }]}
        />

        <View style={styles.legend}>
          {(['light', 'medium', 'heavy'] as FlowLevel[]).map((f) => (
              <View key={f} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.periodFlow[f] }]} />
                <Text style={{ color: colors.textSecondary, fontSize: 12, textTransform: 'capitalize' }}>
                  {f}
                </Text>
              </View>
            ))}
          <View style={styles.legendItem}>
            <View style={[styles.legendRing, { borderColor: colors.primary }]} />
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Symptoms logged</Text>
          </View>
        </View>

        {nextPeriod && (
          <View style={[styles.prediction, { backgroundColor: colors.accentSurface, borderColor: colors.accent }]}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>
              Next period estimated: {formatDisplayDate(nextPeriod)}
            </Text>
          </View>
        )}

        <Text style={[styles.historyTitle, { color: colors.text }]}>History</Text>
        {[...periods]
          .sort((a, b) => b.startDate.localeCompare(a.startDate))
          .map((p) => (
            <View key={p.id} style={[styles.historyItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>
                {formatDisplayDate(p.startDate)}
                {p.endDate ? ` – ${formatDisplayDate(p.endDate)}` : ''}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, textTransform: 'capitalize' }}>
                Flow: {p.flow}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
                {formatPeriodSymptomSummary(p)}
              </Text>
              <EntryActions onEdit={() => openEditPeriodModal(p)} onDelete={() => confirmDelete(p)} />
            </View>
          ))}

        <View style={{ height: 80 }} />
      </ScrollView>

      <Button label="+ Log Period" onPress={openAddPeriodModal} style={styles.fab} />

      <FormModal
        visible={periodModalVisible}
        title={editingId ? 'Edit Period' : 'Log Period'}
        onClose={() => {
          resetPeriodForm();
          setPeriodModalVisible(false);
        }}
        onSave={handleSavePeriod}
      >
        <DateField value={startDate} onChange={setStartDate} label="Start date" />
        {endDate ? (
          <>
            <DateField value={endDate} onChange={setEndDate} label="End date" />
            <Button
              label="Single day only"
              variant="ghost"
              onPress={() => setEndDate('')}
              style={{ marginBottom: spacing.sm }}
            />
          </>
        ) : (
          <Button
            label="Add end date (multi-day period)"
            variant="secondary"
            onPress={() => setEndDate(startDate)}
            style={{ marginBottom: spacing.md }}
          />
        )}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Flow</Text>
        <FlowPicker value={flow} onChange={setFlow} />
        <Text style={[styles.fieldNote, { color: colors.textSecondary }]}>
          After saving, tap individual days on the calendar to log symptoms like cramps or headaches.
        </Text>
      </FormModal>

      <FormModal
        visible={dayModalVisible}
        title={`Symptoms · ${formatDisplayDate(dayDate)}`}
        onClose={() => {
          setDayModalVisible(false);
          setDayPeriodId(null);
          setSelectedSymptoms([]);
        }}
        onSave={handleSaveDaySymptoms}
        saveLabel="Save day"
      >
        {dayPeriod && (
          <Text style={[styles.fieldNote, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
            Period flow: {dayPeriod.flow}
          </Text>
        )}
        <View style={styles.symptomGrid}>
          {PERIOD_SYMPTOM_OPTIONS.map((s) => {
            const selected = selectedSymptoms.includes(s);
            return (
              <Pressable
                key={s}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => toggleSymptom(s)}
                style={({ pressed }) => [
                  styles.symptomChip,
                  {
                    backgroundColor: selected ? colors.primary : colors.background,
                    borderColor: colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text style={{ color: selected ? onPrimary : colors.text, fontSize: 14, fontWeight: '600' }}>
                  {s}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {selectedSymptoms.length === 0 && (
          <Text style={[styles.fieldNote, { color: colors.textSecondary }]}>
            Leave empty and save to clear symptoms for this day.
          </Text>
        )}
      </FormModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 14, marginBottom: spacing.sm, marginTop: spacing.xs },
  calendar: { borderRadius: borderRadius.md, borderWidth: 1, marginBottom: spacing.md },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md, marginBottom: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendRing: { width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  prediction: { padding: spacing.md, borderRadius: borderRadius.sm, borderWidth: 1, marginBottom: spacing.md },
  historyTitle: { fontSize: 18, fontWeight: '600', marginBottom: spacing.sm },
  historyItem: { padding: spacing.md, borderRadius: borderRadius.sm, borderWidth: 1, marginBottom: spacing.sm },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.md,
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
  },
  fieldLabel: { fontSize: 14, marginBottom: spacing.xs, fontWeight: '600' },
  fieldNote: { fontSize: 13, lineHeight: 18 },
  symptomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  symptomChip: {
    minHeight: touchTarget.minSize,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    justifyContent: 'center',
  },
});
