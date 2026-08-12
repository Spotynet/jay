import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { AppText } from '../../../components/ui/AppText';
import { Icon } from '../../../components/ui/Icon';
import { HABIT_ICONS } from '../../../constants/habitIcons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

interface IconPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  icons?: typeof HABIT_ICONS;
}

export const IconPickerModal = ({
  visible,
  onClose,
  onSelect,
  icons = HABIT_ICONS,
}: IconPickerModalProps) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <BlurView intensity={30} style={StyleSheet.absoluteFill} />
        <Animated.View 
          entering={FadeInDown.springify().damping(20)} 
          exiting={FadeOutDown.duration(200)}
          style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}
        >
          <AppText style={[styles.title, { color: colors.text }]}>SELECT ICON</AppText>
          <FlatList
            data={icons}
            numColumns={5}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.iconItem} 
                onPress={() => { onSelect(item.name); onClose(); }}
              >
                <Icon name={item.icon} size={24} color={colors.text} />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.list}
          />
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', padding: 20 },
  container: { height: '70%', borderRadius: 32, padding: 24, borderWidth: 1, elevation: 10 },
  title: { fontSize: 14, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20, textAlign: 'center' },
  list: { gap: 12 },
  iconItem: { width: '20%', alignItems: 'center', paddingVertical: 12 }
});
