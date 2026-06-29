import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import ColorPicker, { Panel1, HueSlider } from 'reanimated-color-picker';
import { useTheme } from '../../../context/ThemeContext';
import { AppText } from '../../../components/ui/AppText';

interface ColorPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (color: string) => void;
  currentColor: string;
}

export const ColorPickerModal = ({ visible, onClose, onSelect, currentColor }: ColorPickerModalProps) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <AppText bold style={[styles.modalTitle, { color: colors.text }]}>Select Accent Color</AppText>
          
          <ColorPicker 
            style={styles.picker} 
            value={currentColor}
            onComplete={(color) => {
              onSelect(color.hex);
              onClose();
            }}
          >
            <Panel1 style={styles.panel} />
            <HueSlider style={styles.slider} />
          </ColorPicker>

          <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.accent }]} onPress={onClose}>
            <AppText style={styles.closeButtonText}>Done</AppText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { padding: 24, borderRadius: 24 },
  modalTitle: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
  picker: { width: '100%', height: 300, gap: 16 },
  panel: { flex: 1, borderRadius: 16 },
  slider: { height: 30, borderRadius: 16 },
  closeButton: { marginTop: 24, padding: 16, borderRadius: 16, alignItems: 'center' },
  closeButtonText: { color: '#fff', fontWeight: 'bold' }
});
