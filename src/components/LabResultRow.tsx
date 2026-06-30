import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { LabResult } from '../types';
import { getLabRangeStatus, getRangeColor } from '../utils/labRanges';
import { formatDisplayDate } from '../utils/dates';

interface LabResultRowProps {
  result: LabResult;
  onPress?: () => void;
  onAttachmentPress?: () => void;
  selected?: boolean;
}

export function LabResultRow({ result, onPress, onAttachmentPress, selected }: LabResultRowProps) {
  const { colors } = useTheme();
  const status = getLabRangeStatus(result);
  const statusColor = getRangeColor(status, colors);

  const content = (
    <View style={[styles.row, selected && { backgroundColor: colors.border + '40' }]}>
      <View style={styles.left}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.primary }]}>{result.testName}</Text>
          {result.attachmentUri && onAttachmentPress && (
            <Pressable onPress={onAttachmentPress} hitSlop={8} style={styles.attachBtn}>
              <Ionicons
                name={result.attachmentKind === 'pdf' ? 'document-attach' : 'image'}
                size={16}
                color={colors.primary}
              />
            </Pressable>
          )}
        </View>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formatDisplayDate(result.date)}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.value, { color: colors.text }]}>
          {result.value} {result.unit}
        </Text>
        <View style={[styles.badge, { backgroundColor: statusColor + '22' }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>
            {status === 'normal' ? 'In range' : status === 'warning' ? 'Borderline' : 'Out of range'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.pressable}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  pressable: { borderRadius: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  left: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 16, fontWeight: '600' },
  attachBtn: { padding: 2 },
  date: { fontSize: 12, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  value: { fontSize: 16, fontWeight: '700' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
