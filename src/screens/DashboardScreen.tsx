import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/ScreenContainer';
import { Card } from '../components/Card';
import { LabResultRow } from '../components/LabResultRow';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { useHealthData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { RootTabParamList } from '../navigation/types';
import { PREDEFINED_SYMPTOMS } from '../constants/symptoms';
import { formatDisplayDate, isTimeSlotPast, timeSlotLabel, todayISO } from '../utils/dates';
import {
  getSymptomChipAccessibilityLabel,
  getSymptomChipIcon,
} from '../utils/symptomChipIcons';
import { TimeSlot } from '../types';
import { onPrimary, spacing } from '../constants/theme';

type Nav = BottomTabNavigationProp<RootTabParamList>;

export default function DashboardScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const { loading, profile, labs, getTodaySymptoms, getMedications, isMedicationTaken, toggleMedicationLog } =
    useHealthData();

  if (loading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const todaySymptoms = getTodaySymptoms();
  const medications = getMedications();
  const recentLabs = [...labs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const greeting = profile.name ? `Hello, ${profile.name}` : 'Hello';

  const slotOrder: TimeSlot[] = ['morning', 'afternoon', 'evening'];
  const medsDue = medications
    .flatMap((med) =>
      med.times
        .filter((slot) => !isMedicationTaken(med.id, slot))
        .map((slot) => ({ med, slot })),
    )
    .sort((a, b) => slotOrder.indexOf(a.slot) - slotOrder.indexOf(b.slot));

  const getSymptomLabel = (id: string) =>
    PREDEFINED_SYMPTOMS.find((s) => s.id === id)?.label ?? id;

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.text }]}>{greeting}</Text>
        <Text style={[styles.date, { color: colors.accent }]}>
          {formatDisplayDate(todayISO())}
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 0 }]}>Quick Actions</Text>
      <View style={styles.actions}>
        <Button
          label="Log Symptom"
          onPress={() => navigation.navigate('Symptoms', { screen: 'SymptomsMain' })}
          style={styles.actionBtn}
        />
        <Button
          label="Log Med"
          onPress={() => navigation.navigate('Medications')}
          style={styles.actionBtn}
        />
        <Button
          label="Add Lab"
          onPress={() => navigation.navigate('Labs')}
          style={styles.actionBtn}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Symptoms</Text>
      {todaySymptoms.length === 0 ? (
        <Card>
          <Text style={{ color: colors.textSecondary }}>No symptoms logged today</Text>
        </Card>
      ) : (
        <View style={styles.chipRow}>
          {todaySymptoms.map((s) => {
            const symptomLabel = getSymptomLabel(s.symptom);
            const chipIcon = getSymptomChipIcon(s, colors);
            return (
              <Chip
                key={s.id}
                label={symptomLabel}
                accessibilityLabel={getSymptomChipAccessibilityLabel(symptomLabel, chipIcon)}
                icon={
                  chipIcon ? (
                    <Ionicons name={chipIcon.name} size={16} color={chipIcon.color} />
                  ) : undefined
                }
              />
            );
          })}
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Medications Due</Text>
      {medsDue.length === 0 ? (
        <Card>
          <Text style={{ color: colors.textSecondary }}>
            All caught up — every dose logged for today
          </Text>
        </Card>
      ) : (
        medsDue.map(({ med, slot }) => {
          const missed = isTimeSlotPast(slot);
          return (
            <Card key={`${med.id}-${slot}`}>
              <View style={styles.medRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.medName, { color: colors.text }]}>{med.name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                    {med.dosage} · {timeSlotLabel(slot)}
                  </Text>
                  {missed && (
                    <Text style={{ color: colors.danger, fontSize: 12, marginTop: 2 }}>Missed</Text>
                  )}
                </View>
                <Button
                  label="Mark taken"
                  onPress={() => toggleMedicationLog(med.id, slot)}
                  style={[styles.takeBtn, { backgroundColor: colors.primary }]}
                  labelStyle={styles.takeBtnText}
                />
              </View>
            </Card>
          );
        })
      )}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Labs</Text>
      {recentLabs.length === 0 ? (
        <Card>
          <Text style={{ color: colors.textSecondary }}>No lab results yet</Text>
        </Card>
      ) : (
        <Card>
          {recentLabs.map((lab, i) => (
            <View key={lab.id}>
              <LabResultRow result={lab} />
              {i < recentLabs.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
        </Card>
      )}
      <View style={{ height: spacing.lg }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginTop: spacing.sm },
  greeting: { fontSize: 28, fontWeight: '700' },
  date: { fontSize: 15, marginTop: spacing.xs, marginBottom: spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm },
  medRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  medName: { fontSize: 16, fontWeight: '600' },
  takeBtn: { paddingHorizontal: spacing.sm, minWidth: 110 },
  takeBtnText: { color: onPrimary, fontSize: 14 },
  divider: { height: 1, marginVertical: 4 },
  actions: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  actionBtn: { flex: 1, minWidth: 100 },
});
