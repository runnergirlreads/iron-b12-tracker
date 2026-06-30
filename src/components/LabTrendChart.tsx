import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { LabResult } from '../types';
import { spacing } from '../constants/theme';

interface LabTrendChartProps {
  results: LabResult[];
  testName: string;
}

export function LabTrendChart({ results, testName }: LabTrendChartProps) {
  const { colors } = useTheme();
  const filtered = results
    .filter((r) => r.testName === testName)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (filtered.length < 2) {
    return (
      <View style={styles.placeholder}>
        <Text style={{ color: colors.textSecondary }}>
          Add at least 2 results for {testName} to see trends
        </Text>
      </View>
    );
  }

  const data = {
    labels: filtered.map((r) => r.date.slice(5)),
    datasets: [{ data: filtered.map((r) => r.value), color: () => colors.primary, strokeWidth: 2 }],
  };

  return (
    <LineChart
      data={data}
      width={Dimensions.get('window').width - 32}
      height={220}
      chartConfig={{
        backgroundColor: colors.card,
        backgroundGradientFrom: colors.card,
        backgroundGradientTo: colors.card,
        decimalPlaces: 1,
        color: () => colors.primary,
        labelColor: () => colors.textSecondary,
        propsForDots: { r: '5', strokeWidth: '2', stroke: colors.primary },
      }}
      bezier
      style={styles.chart}
    />
  );
}

const styles = StyleSheet.create({
  chart: { borderRadius: 12, marginVertical: spacing.sm },
  placeholder: { padding: spacing.lg, alignItems: 'center' },
});
