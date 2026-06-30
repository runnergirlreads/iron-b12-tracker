import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  keyboardVerticalOffset?: number;
}

export function KeyboardAwareScrollView({
  children,
  contentContainerStyle,
  keyboardShouldPersistTaps = 'handled',
  keyboardVerticalOffset,
  ...rest
}: KeyboardAwareScrollViewProps) {
  const headerHeight = useHeaderHeight();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset ?? headerHeight}
    >
      <ScrollView
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        contentContainerStyle={contentContainerStyle}
        {...rest}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
