import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { ModalHeader } from './ModalHeader';

interface TimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  visible: boolean;
  onClose: () => void;
}

export const AppTimePicker = ({ value, onChange, label, visible, onClose }: TimePickerProps) => {
  const { colors, accentColor } = useTheme();
  
  const [hour, setHour] = useState(value.getHours());
  const [minute, setMinute] = useState(value.getMinutes());

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleSave = () => {
    const newDate = new Date(value);
    newDate.setHours(hour);
    newDate.setMinutes(minute);
    onChange(newDate);
    onClose();
  };

  const renderItem = (item: number, isHour: boolean) => (
    <TouchableOpacity 
      style={[styles.item, (isHour ? hour === item : minute === item) ? { backgroundColor: colors.surfaceElevated } : null]}
      onPress={() => isHour ? setHour(item) : setMinute(item)}
    >
      <AppText style={{ color: colors.text, textAlign: 'center', fontSize: 20, fontWeight: isHour ? (hour === item ? '700' : '400') : (minute === item ? '700' : '400') }}>
        {item.toString().padStart(2, '0')}
      </AppText>
    </TouchableOpacity>
  );

  return (
    <Modal transparent={true} visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <ModalHeader title={label || 'SELECT TIME'} onClose={onClose} />
          
          <View style={styles.pickerRow}>
            <FlatList 
              data={hours} 
              keyExtractor={(i) => i.toString()} 
              renderItem={({ item }) => renderItem(item, true)} 
              style={styles.list}
            />
            <AppText style={[styles.separator, { color: colors.text }]}>:</AppText>
            <FlatList 
              data={minutes} 
              keyExtractor={(i) => i.toString()} 
              renderItem={({ item }) => renderItem(item, false)} 
              style={styles.list}
            />
          </View>

          <TouchableOpacity style={[styles.doneButton, { backgroundColor: accentColor }]} onPress={handleSave}>
            <AppText style={styles.doneButtonText}>Done</AppText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '50%' },
  pickerRow: { flexDirection: 'row', justifyContent: 'center', flex: 1 },
  list: { flex: 1 },
  item: { paddingVertical: 12, borderRadius: 8, marginVertical: 2, height: 48, justifyContent: 'center' },
  separator: { fontSize: 24, fontWeight: '700', alignSelf: 'center', marginHorizontal: 16 },
  doneButton: { marginTop: 20, padding: 16, borderRadius: 16, alignItems: 'center' },
  doneButtonText: { color: '#fff', fontWeight: 'bold' }
});
