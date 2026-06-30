import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { useHealthData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import {
  computeLabTrends,
  computeMedicationAdherence,
  computeSymptomReport,
  getLabRangeStatus,
  periodLabel,
  ReportPeriod,
} from '../utils/reports';
import { formatDisplayDate } from '../utils/dates';
import { getRangeColor } from '../utils/labRanges';
import { spacing } from '../constants/theme';

const PERIODS: ReportPeriod[] = [7, 30];

export default function ReportsScreen() {
  const { colors } = useTheme();
  const { symptoms, medLogs, labs, getMedications } = useHealthData();
  const medications = getMedications();
  const [period, setPeriod] = useState<ReportPeriod>(7);

  const symptomReport = useMemo(
    () => computeSymptomReport(symptoms, period),
    [symptoms, period],
  );

  const adherence = useMemo(
    () => computeMedicationAdherence(medications, medLogs, period),
    [medications, medLogs, period],
  );

  const labTrends = useMemo(() => computeLabTrends(labs), [labs]);

  const hasData =
    symptomReport.length > 0 || adherence.length > 0 || labTrends.length > 0;

  return (
    <ScreenContainer>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {periodLabel(period)} summary
      </Text>

      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <Pressable
            key={p}
            onPress={() => setPeriod(p)}
            style={[
              styles.periodBtn,
              {
                backgroundColor: period === p ? colors.primary : colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={{ color: period === p ? '#fff' : colors.text, fontWeight: '600' }}>
              {p === 7 ? 'Weekly' : 'Monthly'}
            </Text>
          </Pressable>
        ))}
      </View>

      {!hasData ? (
        <EmptyState
          title="Not enough data yet"
          message="Log symptoms, medications, and lab results to see insights here."
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
          {symptomReport.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Symptom Averages</Text>
              <Card>
                {symptomReport.map((item, i) => (
                  <View key={item.symptom}>
                    <View style={styles.row}>
                      <Text style={[styles.rowLabel, { color: colors.text }]}>{item.label}</Text>
                      <Text style={[styles.rowValue, { color: colors.primary }]}>
                        {item.avgSeverity != null
                          ? `${item.avgSeverity}/10`
                          : `${item.yesPercent}% yes`}
                      </Text>
                    </View>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                      Logged {item.daysLogged} day{item.daysLogged !== 1 ? 's' : ''}
                      {item.avgSeverity != null ? ` · avg severity` : ` · ${item.yesDays} yes entries`}
                    </Text>
                    {item.avgSeverity != null && (
                      <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              backgroundColor: colors.primary,
                              width: `${(item.avgSeverity / 10) * 100}%`,
                            },
                          ]}
                        />
                      </View>
                    )}
                    {i < symptomReport.length - 1 && (
                      <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    )}
                  </View>
                ))}
              </Card>
            </>
          )}

          {adherence.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Medication Adherence</Text>
              <Card>
                {adherence.map((item, i) => {
                  const barColor =
                    item.percent >= 80
                      ? colors.success
                      : item.percent >= 50
                        ? colors.warning
                        : colors.danger;
                  return (
                    <View key={item.medicationId}>
                      <View style={styles.row}>
                        <Text style={[styles.rowLabel, { color: colors.text }]}>{item.name}</Text>
                        <Text style={[styles.rowValue, { color: barColor }]}>{item.percent}%</Text>
                      </View>
                      <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: spacing.xs }}>
                        Took {item.taken} of {item.expected} doses
                      </Text>
                      <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                        <View
                          style={[
                            styles.barFill,
                            { backgroundColor: barColor, width: `${item.percent}%` },
                          ]}
                        />
                      </View>
                      {i < adherence.length - 1 && (
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                      )}
                    </View>
                  );
                })}
              </Card>
            </>
          )}

          {labTrends.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Lab Trends</Text>
              <Card>
                {labTrends.map((item, i) => {
                  const status = getLabRangeStatus(item.latest);
                  const statusColor = getRangeColor(status, colors);
                  const delta = item.delta;
                  const deltaColor =
                    delta == null
                      ? colors.textSecondary
                      : delta > 0
                        ? colors.success
                        : delta < 0
                          ? colors.danger
                          : colors.textSecondary;

                  return (
                    <View key={item.testName}>
                      <View style={styles.row}>
                        <Text style={[styles.rowLabel, { color: colors.text }]}>{item.testName}</Text>
                        <Text style={[styles.rowValue, { color: colors.text }]}>
                          {item.latest.value} {item.latest.unit}
                        </Text>
                      </View>
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                        Latest: {formatDisplayDate(item.latest.date)}
                        {item.previous && ` · Previous: ${item.previous.value} (${formatDisplayDate(item.previous.date)})`}
                      </Text>
                      <View style={styles.labMeta}>
                        {delta != null && (
                          <Text style={{ color: deltaColor, fontWeight: '600', fontSize: 13 }}>
                            {delta > 0 ? '↑' : delta < 0 ? '↓' : '→'} {Math.abs(delta)} {item.latest.unit}
                            {item.deltaPercent != null ? ` (${item.deltaPercent > 0 ? '+' : ''}${item.deltaPercent}%)` : ''}
                          </Text>
                        )}
                        <View style={[styles.badge, { backgroundColor: statusColor + '22' }]}>
                          <Text style={{ color: statusColor, fontSize: 11, fontWeight: '600' }}>
                            {status === 'normal' ? 'In range' : status === 'warning' ? 'Borderline' : 'Out of range'}
                          </Text>
                        </View>
                      </View>
                      {i < labTrends.length - 1 && (
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                      )}
                    </View>
                  );
                })}
              </Card>
            </>
          )}

          <Card style={{ marginTop: spacing.sm }}>
            <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20 }}>
              Tip: Log symptoms daily and mark medications as taken to get the most accurate weekly and monthly insights.
            </Text>
          </Card>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 14, marginTop: spacing.xs, marginBottom: spacing.sm },
  periodRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  periodBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 16, fontWeight: '600', flex: 1 },
  rowValue: { fontSize: 16, fontWeight: '700' },
  barTrack: { height: 6, borderRadius: 3, marginTop: spacing.sm, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  divider: { height: 1, marginVertical: spacing.md },
  labMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
});
