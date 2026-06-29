import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../ui/Icon';
import { TablerIcon } from 'tabler-icons-react-native';

interface ActionButtonProps {
  icon: TablerIcon;
  onPress: () => void;
  size?: number;
}

export const ActionButton = ({ icon, onPress, size = 44 }: ActionButtonProps) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.7} 
      style={[
        styles.button, 
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2.5,
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
        }
      ]}
    >
      <Icon name={icon} size={20} color={colors.text} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
