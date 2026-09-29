import React from 'react';
import { StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { IconAlertCircle } from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

export const ErrorMessage = ({ message }: { message: string | null }) => {
  const { colors } = useTheme();

  if (!message) return null;

  return (
    <Animated.View
      entering={FadeInDown.springify()}
      exiting={FadeOutUp.duration(200)}
      style={[styles.container, { backgroundColor: colors.error + '1A', borderColor: colors.error + '33' }]}
    >
      <Icon name={IconAlertCircle} size={18} color={colors.error} />
      <AppText style={[styles.text, { color: colors.error }]}>{message}</AppText>
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
    marginBottom: 16,
  },
  text: { fontSize: 13, fontWeight: '600', flex: 1 },
});
