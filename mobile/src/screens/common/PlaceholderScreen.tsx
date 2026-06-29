import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { IconClock } from 'tabler-icons-react-native';
import ScreenLayout from '../../components/common/ScreenLayout';

export default function PlaceholderScreen({ title, message, icon }: { title: string, message: string, icon?: any }) {
  const { colors } = useTheme();

  return (
    <ScreenLayout title={title}>
      <View style={styles.container}>
        <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
          <Icon name={icon || IconClock} size={48} color={colors.accent} />
        </View>
        <AppText bold style={[styles.title, { color: colors.text }]}>COMING SOON</AppText>
        <AppText style={[styles.message, { color: colors.subtext }]}>{message}</AppText>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 24 },
  iconContainer: { padding: 32, borderRadius: 32 },
  title: { fontSize: 24, letterSpacing: 2 },
  message: { fontSize: 16, textAlign: 'center', maxWidth: '80%' }
});
