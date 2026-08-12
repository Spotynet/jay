import React from 'react';
import { TextInput, TextInputProps, StyleSheet, StyleProp, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

interface InputProps extends Omit<TextInputProps, 'style'> {
  style?: StyleProp<TextStyle>;
  /** 'box' = framed (default). 'plain' = frameless, for use inside a Box. */
  variant?: 'box' | 'plain';
}

/**
 * Standard text field — framed (box) with gradient bg, or frameless (plain).
 * box: height: 60, borderWidth: 1, borderRadius: 16, padding: 16, fontSize: 16, fontWeight: '500'.
 */
export default function Input({ style, variant = 'box', ...props }: InputProps) {
  const { colors, isDark } = useTheme();

  const gradientColors = (
    isDark
      ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']
      : ['rgba(0,0,0,0.04)', 'rgba(0,0,0,0)']
  ) as [string, string];

  if (variant === 'plain') {
    return (
      <TextInput
        style={[styles.base, { color: colors.text }, style]}
        placeholderTextColor={colors.subtext}
        {...props}
      />
    );
  }

  return (
    <View style={[styles.box, { borderColor: colors.border }, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <TextInput
        style={[styles.base, { color: colors.text }]}
        placeholderTextColor={colors.subtext}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
    fontWeight: '500',
    padding: 14,
  },
  box: {
    height: 60,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    width: '100%',
  },
});