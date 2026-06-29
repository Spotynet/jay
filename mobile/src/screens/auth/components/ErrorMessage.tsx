import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../../../components/ui/AppText';
import { Icon } from '../../../components/ui/Icon';
import { IconAlertCircle } from 'tabler-icons-react-native';
import { useTheme } from '../../../context/ThemeContext';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

export const ErrorMessage = ({ message }: { message: string | null }) => {
  const { colors } = useTheme();
  
  if (!message) return null;

  return (
    <Animated.View 
      entering={FadeInDown.springify()} 
      exiting={FadeOutUp.duration(200)}
      style={[styles.container, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}
    >
      <Icon name={IconAlertCircle} size={18} color="#FF3B30" />
      <AppText style={[styles.text, { color: '#FF3B30' }]}>{message}</AppText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    borderRadius: 12, 
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)'
  },
  text: { fontSize: 13, fontWeight: '600' }
});
