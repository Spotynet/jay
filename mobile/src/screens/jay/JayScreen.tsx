import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenLayout from '../../components/common/ScreenLayout';
import { useTheme } from '../../context/ThemeContext';

export default function JayScreen() {
  const { colors } = useTheme();
  return (
    <ScreenLayout title="JAY">
      <View style={styles.container}>
        <Text style={{ color: colors.text }}>Welcome to JAY</Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
