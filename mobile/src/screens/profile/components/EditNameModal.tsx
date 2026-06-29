import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { AppText } from '../../../components/ui/AppText';

interface EditNameModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newName: string) => void;
  currentName: string;
}

export const EditNameModal = ({ visible, onClose, onSave, currentName }: EditNameModalProps) => {
  const { colors } = useTheme();
  const [name, setName] = useState(currentName);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <AppText style={[styles.modalTitle, { color: colors.text }]}>Edit Display Name</AppText>
          
          <TextInput 
            value={name}
            onChangeText={setName}
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Enter display name"
            placeholderTextColor={colors.subtext}
          />

          <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.accent }]} onPress={() => { onSave(name); onClose(); }}>
            <AppText style={styles.saveButtonText}>Save</AppText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { padding: 24, borderRadius: 24 },
  modalTitle: { fontSize: 18, marginBottom: 20, textAlign: 'center', fontWeight: '600' },
  input: { padding: 16, borderRadius: 16, fontSize: 16 },
  saveButton: { marginTop: 24, padding: 16, borderRadius: 16, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold' }
});
