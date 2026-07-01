import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { onPrimary, spacing, touchTarget } from '../constants/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Chip({
  label,
  selected = false,
  onPress,
  icon,
  style,
  accessibilityLabel,
}: ChipProps) {
  const { colors } = useTheme();

  const content = (
    <View style={styles.content}>
      <Text
        style={[
          styles.label,
          { color: selected ? onPrimary : colors.text },
        ]}
        numberOfLines={2}
      >
        {label}
      </Text>
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
    </View>
  );

  if (!onPress) {
    return (
      <View
        accessibilityLabel={accessibilityLabel ?? label}
        style={[
          styles.chip,
          { backgroundColor: colors.primarySurface, borderColor: 'transparent' },
          style,
        ]}
      >
        <View style={styles.content}>
          <Text style={[styles.label, { color: colors.primary }]} numberOfLines={2}>
            {label}
          </Text>
          {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
        </View>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const CHIP_PADDING = 10;

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: CHIP_PADDING,
    paddingVertical: CHIP_PADDING,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTarget.minSize,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
