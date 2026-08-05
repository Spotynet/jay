import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';

interface BudgetProgressCardProps {
  title: string;
  spent: number;
  limit: number;
}

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export function BudgetProgressCard({ title, spent, limit }: BudgetProgressCardProps) {
  const { colors, entityColors } = useTheme();
  const progress = limit > 0 ? Math.min(spent / limit, 1) : 0;
  const isOver = spent > limit;
  const barColor = isOver ? colors.error : entityColors.finance;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <AppText bold style={[styles.title, { color: colors.text }]}>{title}</AppText>
        <AppText style={[styles.amount, { color: isOver ? colors.error : colors.subtext }]}>
          {formatMoney(spent)} / {formatMoney(limit)}
        </AppText>
      </View>
      <View style={[styles.track, { backgroundColor: colors.surfaceElevated }]}>
        <View style={[styles.fill, { backgroundColor: barColor, width: `${progress * 100}%` }]} />
      </View>
      {isOver && (
        <AppText style={[styles.overText, { color: colors.error }]}>
          Over budget by {formatMoney(spent - limit)}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
  },
  amount: {
    fontSize: 13,
    fontWeight: '600',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  overText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
