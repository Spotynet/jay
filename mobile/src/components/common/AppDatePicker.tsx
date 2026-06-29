import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Platform, FlatList, SafeAreaView } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { IconChevronLeft, IconChevronRight } from 'tabler-icons-react-native';
import { ModalHeader } from './ModalHeader';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  label?: string;
  visible: boolean;
  onClose: () => void;
}

export default function AppDatePicker({ 
  value, 
  onChange, 
  mode = 'date',
  label,
  visible,
  onClose 
}: DatePickerProps) {
  const { colors, isDark, accentColor } = useTheme();

  if (Platform.OS !== 'web') {
    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        if (event.type === 'set' && selectedDate) onChange(selectedDate);
        onClose();
      } else {
        if (selectedDate) onChange(selectedDate);
      }
    };

    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <ModalHeader title={label || 'SELECT'} onClose={onClose} />
            <DateTimePicker
              value={value}
              mode={mode}
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              themeVariant={isDark ? 'dark' : 'light'}
            />
            <TouchableOpacity style={[styles.doneButton, { backgroundColor: accentColor }]} onPress={onClose}>
              <AppText style={styles.doneButtonText}>Done</AppText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  if (mode === 'time') {
    return <TimePicker value={value} onChange={onChange} label={label} visible={visible} onClose={onClose} />;
  }

  return <CalendarDatePicker value={value} onChange={onChange} label={label} visible={visible} onClose={onClose} />;
}

const TimePicker = ({ value, onChange, label, visible, onClose }: any) => {
  const { colors, accentColor } = useTheme();
  const [selectedTime, setSelectedTime] = useState(new Date(value));
  const [isPM, setIsPM] = useState(value.getHours() >= 12);

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour24 = Math.floor(i / 2);
    const minute = i % 2 === 0 ? 0 : 30;
    const displayHour = (hour24 % 12) || 12;
    const period = hour24 < 12 ? 'AM' : 'PM';
    return { 
      label: `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`, 
      hour: hour24, 
      minute, 
      period 
    };
  });

  const filteredSlots = timeSlots.filter(t => (isPM ? t.period === 'PM' : t.period === 'AM'));

  return (
    <Modal transparent={true} visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <ModalHeader title={label || 'SELECT'} onClose={onClose} />
          <View style={styles.pickerRow}>
            <FlatList data={filteredSlots} keyExtractor={(i) => i.label} renderItem={({ item }) => (
              <TouchableOpacity style={[styles.item, (selectedTime.getHours() === item.hour && selectedTime.getMinutes() === item.minute) && { backgroundColor: accentColor }]} onPress={() => { const d = new Date(selectedTime); d.setHours(item.hour, item.minute); setSelectedTime(d); }}>
                <AppText style={{ color: (selectedTime.getHours() === item.hour && selectedTime.getMinutes() === item.minute) ? 'white' : colors.text }}>{item.label}</AppText>
              </TouchableOpacity>
            )} />
          </View>
          <TouchableOpacity style={[styles.doneButton, { backgroundColor: accentColor }]} onPress={() => { onChange(selectedTime); onClose(); }}>
            <AppText style={styles.doneButtonText}>Done</AppText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const CalendarDatePicker = ({ value, onChange, label, visible, onClose }: any) => {
  const { colors, accentColor } = useTheme();
  const [displayDate, setDisplayDate] = useState(new Date(value));
  const daysInMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Modal transparent={true} visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <ModalHeader title={label || 'SELECT'} onClose={onClose} />
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => setDisplayDate(new Date(displayDate.setMonth(displayDate.getMonth() - 1)))}><Icon name={IconChevronLeft} size={24} color={colors.text} /></TouchableOpacity>
            <AppText style={{ color: colors.text, fontWeight: '600' }}>{displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</AppText>
            <TouchableOpacity onPress={() => setDisplayDate(new Date(displayDate.setMonth(displayDate.getMonth() + 1)))}><Icon name={IconChevronRight} size={24} color={colors.text} /></TouchableOpacity>
          </View>
          <FlatList
            data={[...Array(startDay).fill(null), ...days]}
            numColumns={7}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.calendarDay, item === value.getDate() && displayDate.getMonth() === value.getMonth() && { backgroundColor: accentColor }]}
                onPress={() => { if(item) { const d = new Date(value); d.setDate(item); d.setMonth(displayDate.getMonth()); onChange(d); onClose(); } }}
              >
                <AppText style={{ color: item === value.getDate() && displayDate.getMonth() === value.getMonth() ? 'white' : colors.text }}>{item}</AppText>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '60%' },
  item: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginVertical: 2 },
  doneButton: { marginTop: 20, padding: 16, borderRadius: 16, alignItems: 'center' },
  doneButtonText: { color: '#fff', fontWeight: 'bold' },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  calendarDay: { width: '14.28%', height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 8 }
});
