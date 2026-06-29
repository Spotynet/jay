import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { IconX } from 'tabler-icons-react-native';

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
}

export const ModalHeader = ({ title, onClose }: ModalHeaderProps) => {
  const { colors } = useTheme();
  return (
    <View style={styles.header}>
      <AppText style={[styles.title, { color: colors.text }]}>{title}</AppText>
      <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.border }]}>
        <Icon name={IconX} size={16} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 14, fontWeight: '500', letterSpacing: 3, textTransform: 'uppercase' },
  closeButton: { padding: 4, borderRadius: 12 },
});
