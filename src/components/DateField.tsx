import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing, touchTarget } from '../constants/theme';
import {
  dateToISO,
  formatDisplayDate,
  isValidISODate,
  parseISODate,
  todayISO,
} from '../utils/dates';

interface DateFieldProps {
  value: string;
  onChange: (isoDate: string) => void;
  label?: string;
}

export function DateField({ value, onChange, label = 'Date' }: DateFieldProps) {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [textValue, setTextValue] = useState(value);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setTextValue(value);
    setError(null);
  }, [value]);

  const commitText = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      setError('Enter a date');
      return;
    }
    if (!isValidISODate(trimmed)) {
      setError('Use YYYY-MM-DD');
      return;
    }
    setError(null);
    onChange(trimmed);
  };

  const onPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type === 'dismissed' || !selected) return;
    const iso = dateToISO(selected);
    setTextValue(iso);
    setError(null);
    onChange(iso);
  };

  const pickerDate = isValidISODate(value) ? parseISODate(value) : parseISODate(todayISO());

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.text }]} accessibilityRole="text">
        {label}
      </Text>
      <View style={styles.row}>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: error ? colors.danger : colors.border,
              backgroundColor: colors.card,
            },
          ]}
          value={textValue}
          onChangeText={setTextValue}
          onBlur={() => commitText(textValue)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numbers-and-punctuation"
          accessibilityLabel={`${label}, format year month day`}
          returnKeyType="done"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open calendar to pick date"
          onPress={() => setShowPicker(true)}
          style={({ pressed }) => [
            styles.calendarBtn,
            {
              borderColor: colors.border,
              backgroundColor: colors.card,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={{ color: colors.primary, fontSize: 20 }}>📅</Text>
        </Pressable>
      </View>
      {error ? (
        <Text style={[styles.hint, { color: colors.danger }]}>{error}</Text>
      ) : isValidISODate(value) ? (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          {formatDisplayDate(value)}
        </Text>
      ) : null}
      {showPicker && (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onPickerChange}
        />
      )}
      {showPicker && Platform.OS === 'ios' && (
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowPicker(false)}
          style={styles.donePicker}
        >
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Done</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { fontSize: 16, fontWeight: '600', marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    minHeight: touchTarget.minSize,
    fontSize: 16,
  },
  calendarBtn: {
    minWidth: touchTarget.minSize,
    minHeight: touchTarget.minSize,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { fontSize: 13, marginTop: spacing.xs },
  donePicker: {
    alignSelf: 'flex-end',
    minHeight: touchTarget.minSize,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
});
