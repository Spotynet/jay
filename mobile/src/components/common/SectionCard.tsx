import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';

interface SectionCardProps {
  children: React.ReactNode;
  title?: string;
  accessory?: React.ReactNode;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
  cardStyle?: StyleProp<ViewStyle>;
}

export default function SectionCard({ children, title, accessory, accentColor, style, cardStyle }: SectionCardProps) {
  const { colors, isDark } = useTheme();

  const gradientColors = (
    accentColor
      ? [accentColor + '14', accentColor + '04']
      : isDark
        ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']
        : ['rgba(0,0,0,0.04)', 'rgba(0,0,0,0)']
  ) as [string, string];

  return (
    <View style={[styles.section, style]}>
      {(title || accessory) && (
        <View style={styles.headerRow}>
          {title && <AppText style={[styles.title, { color: colors.subtext }]}>{title}</AppText>}
          {accessory}
        </View>
      )}
      <View
        style={[
          styles.card,
          {
            backgroundColor: accentColor ? colors.surface : 'transparent',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          },
          cardStyle,
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
});