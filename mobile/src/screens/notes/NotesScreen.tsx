import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import ScreenLayout from '../../components/common/ScreenLayout';

export default function NotesScreen() {
  const { colors } = useTheme();

  return (
    <ScreenLayout title="Plan">
      <Text style={[styles.title, { color: colors.accent }]}>Notes</Text>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold' },
});
