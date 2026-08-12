import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from './Icon';
import { IconPencil } from 'tabler-icons-react-native';

interface IconCircleProps {
  icon: any;
  accentColor: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Standard icon button — 60×60 gradient circle with centered icon and an accent edit badge at bottom-right.
 * borderRadius: 16, borderWidth: 1.5.
 */
export default function IconCircle({ icon, accentColor, onPress, style }: IconCircleProps) {
  const { colors, isDark } = useTheme();

  const gradientColors = (
    isDark
      ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']
      : ['rgba(0,0,0,0.04)', 'rgba(0,0,0,0)']
  ) as [string, string];

  return (
    <TouchableOpacity
      style={[styles.circle, { borderColor: colors.border }, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <Icon name={icon} size={20} color={accentColor} />
      <View style={[styles.badge, { backgroundColor: accentColor }]}>
        <Icon name={IconPencil} size={10} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    padding: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#09090A',
  },
});