import React from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../context/ThemeContext';
import { LabResult } from '../types';
import { spacing } from '../constants/theme';

interface LabAttachmentViewerProps {
  lab: LabResult | null;
  visible: boolean;
  onClose: () => void;
}

export function LabAttachmentViewer({ lab, visible, onClose }: LabAttachmentViewerProps) {
  const { colors } = useTheme();

  if (!lab?.attachmentUri) return null;

  const openPdf = async () => {
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(lab.attachmentUri!, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
      });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {lab.attachmentName ?? 'Lab attachment'}
          </Text>

          {lab.attachmentKind === 'image' ? (
            <Image source={{ uri: lab.attachmentUri }} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={[styles.pdfBox, { borderColor: colors.border }]}>
              <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md }}>
                PDF attached to this lab result
              </Text>
              <Pressable style={[styles.openBtn, { backgroundColor: colors.primary }]} onPress={openPdf}>
                <Text style={styles.openBtnText}>Open PDF</Text>
              </Pressable>
            </View>
          )}

          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: { borderRadius: 12, padding: spacing.md, maxHeight: '85%' },
  title: { fontSize: 16, fontWeight: '700', marginBottom: spacing.sm },
  image: { width: '100%', height: 360, borderRadius: 8 },
  pdfBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.lg,
    alignItems: 'center',
  },
  openBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 8 },
  openBtnText: { color: '#fff', fontWeight: '700' },
  closeBtn: { alignItems: 'center', marginTop: spacing.md },
});
