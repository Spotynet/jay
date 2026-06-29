import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Button({ title, onPress, variant = 'primary', style, textStyle }: ButtonProps) {
  const { colors } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary': return { backgroundColor: colors.accent };
      case 'secondary': return { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 };
      case 'outline': return { backgroundColor: 'transparent', borderColor: colors.accent, borderWidth: 1 };
      case 'danger': return { backgroundColor: '#FF3B30' };
      default: return { backgroundColor: colors.accent };
    }
  };

  const getTextColor = () => {
    if (variant === 'secondary') return colors.text;
    if (variant === 'outline') return colors.accent;
    return 'white';
  };

  return (
    <TouchableOpacity 
      style={[styles.button, getVariantStyle(), style]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
