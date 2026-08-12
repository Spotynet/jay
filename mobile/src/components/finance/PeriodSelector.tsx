import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { IconChevronLeft, IconChevronRight } from 'tabler-icons-react-native';

interface PeriodSelectorProps {
  month: number;
  year: number;
  onPrev: () => void;
  onNext: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function PeriodSelector({ month, year, onPrev, onNext }: PeriodSelectorProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrev} style={styles.arrow} activeOpacity={0.5} hitSlop={8}>
        <Icon name={IconChevronLeft} size={18} color={colors.subtext} />
      </TouchableOpacity>
      <View style={styles.center} pointerEvents="none">
        <AppText bold style={[styles.month, { color: colors.text }]}>{MONTHS[month]}</AppText>
        <AppText style={[styles.year, { color: colors.subtext }]}>{year}</AppText>
      </View>
      <TouchableOpacity onPress={onNext} style={styles.arrow} activeOpacity={0.5} hitSlop={8}>
        <Icon name={IconChevronRight} size={18} color={colors.subtext} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  arrow: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  center: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  month: {
    fontSize: 16,
    letterSpacing: 0.3,
  },
  year: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});