import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { AppText } from '../../../components/ui/AppText';

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 
  'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney'
];

interface TimezonePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (timezone: string) => void;
  currentTimezone: string;
}

export const TimezonePickerModal = ({ visible, onClose, onSelect, currentTimezone }: TimezonePickerModalProps) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <SafeAreaView edges={['bottom']}>
            <AppText style={[styles.modalTitle, { color: colors.text }]}>Select Timezone</AppText>
            <FlatList
              data={TIMEZONES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.item, { borderBottomColor: colors.border }]} 
                  onPress={() => { onSelect(item); onClose(); }}
                >
                  <AppText style={{ color: item === currentTimezone ? colors.accent : colors.text }}>{item}</AppText>
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalTitle: { fontSize: 18, marginBottom: 20, textAlign: 'center', fontWeight: '600' },
  item: { paddingVertical: 20, borderBottomWidth: 0.5 },
});
