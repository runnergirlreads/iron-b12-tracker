import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, onPrimary, spacing, touchTarget } from '../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  compact?: boolean;
  header?: boolean;
  large?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export function Button({
  label,
  variant = 'primary',
  compact = false,
  header = false,
  large = false,
  disabled,
  style,
  labelStyle,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();

  const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
    primary: { bg: colors.primary, text: onPrimary },
    secondary: { bg: colors.card, text: colors.text, border: colors.border },
    ghost: { bg: 'transparent', text: colors.primary, border: 'transparent' },
    danger: { bg: colors.danger, text: onPrimary },
  };

  const v = variantStyles[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      hitSlop={compact ? touchTarget.hitSlop : undefined}
      style={({ pressed }) => [
        styles.base,
        large ? styles.large : header ? styles.header : compact ? styles.compact : styles.default,
        {
          backgroundColor: v.bg,
          borderColor: v.border ?? v.bg,
          borderWidth: variant === 'ghost' ? 0 : 1,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
      {...rest}
    >
      <Text style={[styles.label, large && styles.labelLarge, { color: v.text }, labelStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  default: {
    minHeight: touchTarget.minSize,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  compact: {
    minHeight: touchTarget.minSize,
    minWidth: touchTarget.minSize,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  header: {
    minHeight: touchTarget.minSize,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  large: {
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  labelLarge: {
    fontSize: 18,
  },
});
