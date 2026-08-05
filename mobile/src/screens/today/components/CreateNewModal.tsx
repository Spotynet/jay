import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { AppText } from '../../../components/ui/AppText';
import { Icon } from '../../../components/ui/Icon';
import { 
  IconChecklist, IconCalendarEvent, IconRepeat, IconBook, IconX, IconWallet 
} from 'tabler-icons-react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

interface CreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: string) => void;
}

const OPTIONS = [
  { id: 'Task', entityKey: 'tasks', label: 'NEW TASK', sub: 'ORGANIZE YOUR ACTION', icon: IconChecklist },
  { id: 'Event', entityKey: 'events', label: 'NEW EVENT', sub: 'SCHEDULE YOUR TIME', icon: IconCalendarEvent },
  { id: 'Habit', entityKey: 'habits', label: 'NEW HABIT', sub: 'BUILD CONSISTENCY', icon: IconRepeat },
  { id: 'Finance', entityKey: 'finance', label: 'FINANCE ENTRY', sub: 'MANAGE YOUR MONEY', icon: IconWallet },
  { id: 'Journal', entityKey: 'journal', label: 'JOURNAL ENTRY', sub: 'CAPTURE YOUR THOUGHTS', icon: IconBook },
];

export const CreateNewModal = ({ visible, onClose, onSelect }: CreateModalProps) => {
  const { colors, entityColors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <BlurView intensity={30} style={StyleSheet.absoluteFill} />
        <Animated.View 
          entering={FadeInDown.springify().damping(20)} 
          exiting={FadeOutDown.duration(200)}
          style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}
        >
          <View style={styles.header}>
            <AppText style={[styles.title, { color: colors.text }]}>CREATION HUB</AppText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name={IconX} size={20} color={colors.subtext} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {OPTIONS.map((item) => {
              const entityColor = entityColors[item.entityKey as keyof typeof entityColors] || colors.accent;
              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.option, { backgroundColor: colors.surface, borderLeftColor: entityColor }]} 
                  onPress={() => onSelect(item.id)}
                >
                  <Icon name={item.icon} size={24} color={entityColor} />
                  <View style={styles.textColumn}>
                    <AppText style={[styles.optionLabel, { color: colors.text }]}>{item.label}</AppText>
                    <AppText style={[styles.optionSub, { color: colors.subtext }]}>{item.sub}</AppText>
                  </View>
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  container: { 
    maxHeight: '90%', 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    paddingTop: 32,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: -5 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 20, 
    elevation: 10 
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 14, fontWeight: '500', letterSpacing: 3, textTransform: 'uppercase' },
  closeButton: { padding: 4, borderRadius: 12 },
  option: { 
    flexDirection: 'row', 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center', 
    gap: 16,
    borderWidth: 0.5,
    borderLeftWidth: 3,
    marginBottom: 12,
  },
  list: { flexGrow: 0 },
  textColumn: { gap: 2 },
  optionLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  optionSub: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' }
});
