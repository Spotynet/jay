import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

interface BoxProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Standard section box — gradient card with the app's default padding, radius, and border.
 * paddingVertical: 20, paddingHorizontal: 24, borderRadius: 16, borderWidth: 1, width: '100%'.
 */
export default function Box({ children, style }: BoxProps) {
  const { colors, isDark } = useTheme();

  const gradientColors = (
    isDark
      ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']
      : ['rgba(0,0,0,0.04)', 'rgba(0,0,0,0)']
  ) as [string, string];

  return (
    <View
      style={[
        styles.box,
        { borderColor: colors.border, backgroundColor: 'transparent' },
        style,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    width: '100%',
    overflow: 'hidden',
  },
});