import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing, touchTarget } from '../constants/theme';
import { Button } from './Button';

interface FormModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  saveLabel?: string;
  children: React.ReactNode;
}

export function FormModal({
  visible,
  title,
  onClose,
  onSave,
  saveLabel = 'Save',
  children,
}: FormModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.dismissArea} onPress={onClose} accessibilityLabel="Close form" />
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
            {title}
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {children}
          </ScrollView>
          <View style={styles.actions}>
            <Button label="Cancel" variant="ghost" onPress={onClose} style={styles.actionBtn} large />
            <Button label={saveLabel} onPress={onSave} style={styles.actionBtn} large />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dismissArea: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  keyboard: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    maxHeight: '90%',
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: spacing.md },
  scrollContent: { paddingBottom: spacing.sm },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.3)',
  },
  actionBtn: { flex: 1, minWidth: 120 },
});
