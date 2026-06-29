import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../ui/Icon';
import { TablerIcon } from 'tabler-icons-react-native';

interface FrostedButtonProps {
  icon: TablerIcon;
  onPress: () => void;
}

export const FrostedButton = ({ icon, onPress }: FrostedButtonProps) => {
  const { colors } = useTheme();

  const ButtonContent = (
    <View style={styles.button}>
      <Icon name={icon} size={20} color={colors.text} />
    </View>
  );

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
      {Platform.OS === 'ios' ? (
        <BlurView 
          intensity={80} 
          tint={colors.theme === 'dark' ? 'dark' : 'light'} 
          style={[styles.blur, { borderColor: colors.border }]}
        >
          {ButtonContent}
        </BlurView>
      ) : (
        <View style={[styles.blur, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {ButtonContent}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  blur: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
