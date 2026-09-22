import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { IconTrendingUp, IconTrendingDown, IconChevronRight } from 'tabler-icons-react-native';
import { parseLocalDate } from '../../utils/date';
import { FINANCE_ICONS } from '../../constants/financeIcons';

const resolveIcon = (name?: string) =>
  (name && FINANCE_ICONS.find((i) => i.name === name)?.icon) || null;

interface TransactionRowProps {
  description: string;
  amount: number;
  type: 'EXPENSE' | 'EARNING';
  date: string;
  parentCategory?: string;
  iconName?: string;
  iconColor?: string;
  onPress?: () => void;
  isLast?: boolean;
}

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export function TransactionRow({ description, amount, type, date, parentCategory, iconName, iconColor, onPress, isLast }: TransactionRowProps) {
  const { colors } = useTheme();
  const isIncome = type === 'EARNING';
  const CategoryIcon = iconName ? resolveIcon(iconName) : null;

  const formatDate = (dateStr: string) => {
    try {
      const d = parseLocalDate(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={!onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: (iconColor || (isIncome ? '#34C759' : '#FF3B30')) + '1A' }]}>
        {CategoryIcon ? (
          <Icon name={CategoryIcon} size={18} color={iconColor || (isIncome ? '#34C759' : '#FF3B30')} />
        ) : (
          <Icon name={isIncome ? IconTrendingUp : IconTrendingDown} size={18} color={isIncome ? '#34C759' : '#FF3B30'} />
        )}
      </View>
      <View style={styles.content}>
        <AppText bold style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {description || 'Transaction'}
        </AppText>
        <AppText style={[styles.meta, { color: colors.subtext }]}>
          {formatDate(date)}{parentCategory ? `  ·  ${parentCategory}` : ''}
        </AppText>
      </View>
      <View style={styles.right}>
        <AppText bold style={[styles.amount, { color: isIncome ? '#34C759' : '#FF3B30' }]}>
          {isIncome ? '+' : '-'}{formatMoney(amount)}
        </AppText>
        {onPress && <Icon name={IconChevronRight} size={16} color={colors.subtext} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
  },
  meta: {
    fontSize: 12,
    fontWeight: '500',
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    fontSize: 15,
  },
});
