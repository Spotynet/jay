import React from 'react';
import { View, StyleSheet, Modal, TouchableWithoutFeedback, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { IconX, IconEdit, IconCheck, IconMapPin, IconClock, IconCash } from 'tabler-icons-react-native';

interface DetailsModalProps {
  visible: boolean;
  onClose: () => void;
  item: any;
  onEdit: () => void;
  onToggle?: () => void;
}

export const DetailsModal = ({ visible, onClose, item, onEdit, onToggle }: DetailsModalProps) => {
  const { colors, accentColor } = useTheme();

  if (!item) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={[styles.grabber, { backgroundColor: colors.border }]} />
              
              <View style={styles.header}>
                <AppText style={[styles.typeLabel, { color: accentColor }]}>{item.type.toUpperCase()}</AppText>
                <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.surfaceElevated }]}>
                  <Icon name={IconX} size={18} color={colors.subtext} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.titleRow}>
                    <AppText style={[styles.title, { color: colors.text, flex: 1 }]}>{item.title}</AppText>
                    {(item.type === 'task' || item.type === 'habit') && (
                        <TouchableOpacity 
                            style={[styles.checkbox, { borderColor: colors.border }, item.isCompleted && { borderColor: accentColor, backgroundColor: accentColor }]} 
                            onPress={onToggle}
                        >
                            {item.isCompleted && <Icon name={IconCheck} size={16} color={colors.background} />}
                        </TouchableOpacity>
                    )}
                </View>
                
                <View style={styles.detailsContainer}>
                  {item.durationMinutes && (
                    <View style={styles.detailRow}>
                      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceElevated }]}>
                        <Icon name={IconClock} size={16} color={accentColor} />
                      </View>
                      <AppText style={[styles.value, { color: colors.text }]}>
                        {Math.floor(item.durationMinutes / 60)}h {item.durationMinutes % 60}m
                      </AppText>
                    </View>
                  )}
                  {item.timeRange && !item.durationMinutes && (
                    <View style={styles.detailRow}>
                      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceElevated }]}>
                        <Icon name={item.type === 'finance' ? IconCash : IconClock} size={16} color={accentColor} />
                      </View>
                      <AppText style={[styles.value, { color: colors.text }]}>{item.timeRange}</AppText>
                    </View>
                  )}
                  {item.location && (
                    <View style={styles.detailRow}>
                      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceElevated }]}>
                        <Icon name={IconMapPin} size={16} color={accentColor} />
                      </View>
                      <AppText style={[styles.value, { color: colors.text }]}>{item.location}</AppText>
                    </View>
                  )}
                </View>
              </ScrollView>
              
              {item.type !== 'finance' && (
                <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.surfaceElevated }]} onPress={onEdit}>
                    <AppText style={[styles.editText, { color: colors.text }]}>Edit Details</AppText>
                </TouchableOpacity>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '100%', maxHeight: '50%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40 },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  closeButton: { padding: 8, borderRadius: 20 },
  typeLabel: { fontSize: 10, letterSpacing: 3, fontWeight: '700' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700' },
  checkbox: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginLeft: 16 },
  scrollContainer: { gap: 16 },
  detailsContainer: { gap: 12, marginTop: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer: { padding: 8, borderRadius: 12 },
  value: { fontSize: 15, fontWeight: '400' },
  editButton: { marginTop: 24, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  editText: { fontSize: 14, fontWeight: '600', letterSpacing: 1 }
});
