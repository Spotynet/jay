import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { IconChevronRight } from 'tabler-icons-react-native';

interface CellProps {
  title: string;
  desc: string;
  icon: any;
  onPress: () => void;
  status?: string;
  meta?: string;
  isLast?: boolean;
}

export const SystemRow = ({ title, desc, icon, onPress, status, meta, isLast }: CellProps) => {
  const { colors, accentColor, isDark } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.main}>
        <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
          <Icon name={icon} size={22} color={accentColor} />
        </View>
        <View style={styles.content}>
          <AppText style={[styles.title, { color: colors.text }]}>{title}</AppText>
          <AppText style={[styles.desc, { color: colors.subtext }]}>{desc}</AppText>
        </View>
        <Icon name={IconChevronRight} size={20} color={colors.subtext} />
      </View>

      <View style={[styles.footer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
        <AppText style={[styles.meta, { color: colors.text }]}>{status} • {meta}</AppText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingTop: 16,
    overflow: 'hidden',
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 16,
  },
  iconBox: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  content: { flex: 1, gap: 1 },
  title: { fontSize: 16, fontWeight: '700' },
  desc: { fontSize: 13, fontWeight: '400' },
  footer: { paddingVertical: 8, paddingHorizontal: 20 },
  meta: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },
});
