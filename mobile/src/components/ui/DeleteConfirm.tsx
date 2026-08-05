import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { IconX } from 'tabler-icons-react-native';

interface DeleteConfirmProps {
  visible: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirm({ visible, title = 'DELETE', message = 'Are you sure you want to delete this? This action cannot be undone.', onConfirm, onCancel }: DeleteConfirmProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.container, { backgroundColor: colors.surface }]}>
              <View style={[styles.grabber, { backgroundColor: colors.border }]} />
              
              <View style={styles.header}>
                <AppText style={[styles.eyebrow, { color: '#FF3B30' }]}>DELETE</AppText>
              </View>

              <AppText style={[styles.message, { color: colors.subtext }]}>{message}</AppText>
              
              <View style={styles.buttonStack}>
                <TouchableOpacity onPress={onConfirm} style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}>
                  <AppText style={{ fontSize: 14, fontWeight: '600', letterSpacing: 1, color: '#FFFFFF' }}>Delete</AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={onCancel} style={[styles.cancelButton, { backgroundColor: colors.surfaceElevated }]}>
                  <AppText style={{ fontSize: 14, fontWeight: '600', letterSpacing: 1, color: colors.text }}>Cancel</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  container: { width: '100%', padding: 24, paddingBottom: 40, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  closeButton: { padding: 8, borderRadius: 20 },
  eyebrow: { fontSize: 10, letterSpacing: 3, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  message: { fontSize: 15, marginBottom: 24, lineHeight: 22 },
  buttonStack: { gap: 12 },
  actionButton: { paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  cancelButton: { paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
});
