import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { IconChevronRight } from 'tabler-icons-react-native';

interface CellProps {
  title: string;
  icon: any;
  onPress: () => void;
  status?: string;
  meta?: string;
  isLast?: boolean;
}

export const SystemManagementCell = ({ title, icon, onPress, status, meta, isLast }: CellProps) => {
  const { colors, entityColors, accentColor } = useTheme();
  
  const entityKey = title.toLowerCase() as keyof typeof entityColors;
  const entityColor = entityColors[entityKey] || accentColor;

  return (
    <TouchableOpacity 
      style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[colors.surfaceElevated, colors.card]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.main}>
        <View style={styles.iconBox}>
            <View style={[styles.iconGlow, { backgroundColor: entityColor }]} />
            <Icon name={icon} size={24} color={entityColor} />
        </View>
        <View style={styles.content}>
          <AppText style={[styles.title, { color: colors.text }]}>{title}</AppText>
          {status && (
            <AppText style={[styles.meta, { color: colors.subtext, marginTop: 2 }]}>{status} • {meta}</AppText>
          )}
        </View>
        <Icon name={IconChevronRight} size={20} color={colors.subtext} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingTop: 12,
    overflow: 'hidden',
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 16,
  },
  iconBox: { 
    width: 56, 
    height: 56, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  iconGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.15,
  },
  content: { flex: 1, gap: 1 },
  title: { fontSize: 17, fontWeight: '700', letterSpacing: 3 },
  meta: { fontSize: 13, fontWeight: '600' },
});
