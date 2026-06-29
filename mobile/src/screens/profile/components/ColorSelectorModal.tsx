import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useTheme, ACCENT_COLORS } from '../../../context/ThemeContext';
import { AppText } from '../../../components/ui/AppText';
import { Icon } from '../../../components/ui/Icon';
import { IconPalette } from 'tabler-icons-react-native';

interface ColorSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (color: string) => void;
  currentColor: string;
}

export const ColorSelectorModal = ({ visible, onClose, onSelect, currentColor }: ColorSelectorProps) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <AppText bold style={[styles.modalTitle, { color: colors.text }]}>Select Accent Color</AppText>
          <View style={styles.colorsGrid}>
            {ACCENT_COLORS.map((color) => (
              <TouchableOpacity 
                key={color} 
                style={[styles.colorCircle, { backgroundColor: color, borderWidth: currentColor === color ? 3 : 0, borderColor: colors.text }]}
                onPress={() => { onSelect(color); onClose(); }}
              />
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { padding: 24, borderRadius: 24, alignItems: 'center' },
  modalTitle: { fontSize: 18, marginBottom: 20 },
  colorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  colorCircle: { width: 50, height: 50, borderRadius: 25 }
});
