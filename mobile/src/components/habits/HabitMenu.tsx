import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';

interface HabitMenuProps {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export const HabitMenu = ({ visible, onClose, onDelete }: HabitMenuProps) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <View style={[styles.menu, { backgroundColor: '#1C1C1E' }]}>
          <TouchableOpacity onPress={onDelete} style={styles.menuItem}>
            <AppText style={{ color: '#FF3B30' }}>Delete Habit</AppText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  menu: { width: 200, padding: 10, borderRadius: 12, backgroundColor: '#1C1C1E' },
  menuItem: { padding: 15, alignItems: 'center' },
});
