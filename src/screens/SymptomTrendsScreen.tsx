import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ScreenContainer } from '../components/ScreenContainer';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { useHealthData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { PREDEFINED_SYMPTOMS } from '../constants/symptoms';
import { spacing } from '../constants/theme';
import {
  buildAlignedSymptomChart,
  computeSymptomPeriodCorrelation,
  listPeriodRangesInRange,
} from '../utils/periodCorrelation';

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

export default function SymptomTrendsScreen() {
  const { colors } = useTheme();
  const { symptoms, periods } = useHealthData();
  const [selectedSymptom, setSelectedSymptom] = useState(PREDEFINED_SYMPTOMS[0].id);
  const [rangeDays, setRangeDays] = useState(30);
  const [showPeriodOverlay, setShowPeriodOverlay] = useState(true);

  const symptomOptions = useMemo(() => {
    const customIds = [...new Set(symptoms.map((s) => s.symptom))].filter(
      (id) => !PREDEFINED_SYMPTOMS.some((p) => p.id === id),
    );
    return [
      ...PREDEFINED_SYMPTOMS,
      ...customIds.map((id) => ({ id, label: id, inputType: 'slider' as const })),
    ];
  }, [symptoms]);

  const alignedChart = useMemo(
    () => buildAlignedSymptomChart(symptoms, periods, selectedSymptom, rangeDays),
    [symptoms, periods, selectedSymptom, rangeDays],
  );

  const correlation = useMemo(
    () => computeSymptomPeriodCorrelation(symptoms, periods, selectedSymptom, rangeDays),
    [symptoms, periods, selectedSymptom, rangeDays],
  );

  const periodRanges = useMemo(
    () => listPeriodRangesInRange(periods, rangeDays),
    [periods, rangeDays],
  );

  const selectedLabel = symptomOptions.find((s) => s.id === selectedSymptom)?.label ?? selectedSymptom;

  const chartData = alignedChart
    ? {
        labels: alignedChart.labels,
        datasets: [
          {
            data: alignedChart.severityData,
            color: () => colors.primary,
            strokeWidth: 2,
          },
          ...(showPeriodOverlay && alignedChart.hasPeriodOverlay
            ? [
                {
                  data: alignedChart.periodData,
                  color: () => colors.warning,
                  strokeWidth: 2,
                },
              ]
            : []),
        ],
        legend: showPeriodOverlay && alignedChart.hasPeriodOverlay
          ? ['Symptom severity', 'Period intensity']
          : ['Symptom severity'],
      }
    : null;

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Symptom</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {symptomOptions.map((s) => (
            <Chip
              key={s.id}
              label={s.label}
              selected={selectedSymptom === s.id}
              onPress={() => setSelectedSymptom(s.id)}
            />
          ))}
        </ScrollView>

        <Text style={[styles.label, { color: colors.textSecondary, marginTop: spacing.md }]}>Date range</Text>
        <View style={styles.rangeRow}>
          {RANGES.map((r) => (
            <Chip
              key={r.days}
              label={r.label}
              selected={rangeDays === r.days}
              onPress={() => setRangeDays(r.days)}
              style={styles.rangeChip}
            />
          ))}
        </View>

        <Card>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>Show period overlay</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                Amber line shows period flow intensity (light 3, medium 6, heavy 9)
              </Text>
            </View>
            <Switch
              value={showPeriodOverlay}
              onValueChange={setShowPeriodOverlay}
              trackColor={{ false: colors.border, true: colors.warning + '88' }}
              thumbColor={showPeriodOverlay ? colors.warning : '#f4f4f5'}
            />
          </View>
        </Card>

        {correlation && (correlation.onPeriodAvg != null || correlation.offPeriodAvg != null) && (
          <Card>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Period correlation</Text>
            <View style={styles.statRow}>
              <Text style={{ color: colors.textSecondary }}>On period days</Text>
              <Text style={{ color: colors.text, fontWeight: '700' }}>
                {correlation.onPeriodAvg != null ? `${correlation.onPeriodAvg}/10` : '—'}
                {' '}({correlation.onPeriodDays} days)
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={{ color: colors.textSecondary }}>Off period days</Text>
              <Text style={{ color: colors.text, fontWeight: '700' }}>
                {correlation.offPeriodAvg != null ? `${correlation.offPeriodAvg}/10` : '—'}
                {' '}({correlation.offPeriodDays} days)
              </Text>
            </View>
            {correlation.difference != null && (
              <Text style={{ color: colors.primary, fontWeight: '600', marginTop: spacing.sm }}>
                {correlation.difference > 0
                  ? `${selectedLabel} is ${Math.abs(correlation.difference)} points higher during periods`
                  : correlation.difference < 0
                    ? `${selectedLabel} is ${Math.abs(correlation.difference)} points lower during periods`
                    : `${selectedLabel} is similar on and off period days`}
              </Text>
            )}
          </Card>
        )}

        <Text style={[styles.chartTitle, { color: colors.text }]}>{selectedLabel} over time</Text>

        {chartData ? (
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 32}
            height={240}
            chartConfig={{
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 0,
              color: () => colors.primary,
              labelColor: () => colors.textSecondary,
              propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
            }}
            bezier
            style={styles.chart}
            fromZero
            segments={5}
          />
        ) : (
          <View style={[styles.empty, { backgroundColor: colors.card }]}>
            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
              No severity data for {selectedLabel} in the last {rangeDays} days.
              Log symptoms with severity scales to see trends.
            </Text>
          </View>
        )}

        {periodRanges.length > 0 && (
          <Card>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Periods in range</Text>
            {periodRanges.map((range) => (
              <View key={range.label} style={styles.periodItem}>
                <View style={[styles.flowDot, { backgroundColor: colors.periodFlow[range.flow] }]} />
                <Text style={{ color: colors.text, flex: 1 }}>{range.label}</Text>
                <Text style={{ color: colors.textSecondary, textTransform: 'capitalize' }}>{range.flow}</Text>
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
  label: { fontSize: 13, fontWeight: '600', marginBottom: spacing.sm },
  chipScroll: { marginBottom: spacing.sm },
  rangeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  rangeChip: { flexGrow: 1, flexBasis: '30%' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.sm },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  chartTitle: { fontSize: 18, fontWeight: '600', marginTop: spacing.md, marginBottom: spacing.sm },
  chart: { borderRadius: 12 },
  empty: { padding: spacing.lg, borderRadius: 12, marginTop: spacing.sm },
  periodItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  flowDot: { width: 10, height: 10, borderRadius: 5 },
});
