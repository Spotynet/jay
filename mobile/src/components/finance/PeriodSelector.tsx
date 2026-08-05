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
  const { colors, entityColors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity onPress={onPrev} style={styles.arrow} activeOpacity={0.6}>
        <Icon name={IconChevronLeft} size={20} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.center}>
        <AppText bold style={[styles.month, { color: colors.text }]}>{MONTHS[month]}</AppText>
        <AppText style={[styles.year, { color: colors.subtext }]}>{year}</AppText>
      </View>
      <TouchableOpacity onPress={onNext} style={styles.arrow} activeOpacity={0.6}>
        <Icon name={IconChevronRight} size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  arrow: {
    padding: 8,
  },
  center: {
    alignItems: 'center',
  },
  month: {
    fontSize: 17,
  },
  year: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 1,
  },
});
