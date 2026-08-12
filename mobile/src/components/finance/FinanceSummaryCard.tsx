import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { IconTrendingUp, IconTrendingDown, IconWallet } from 'tabler-icons-react-native';

interface FinanceSummaryCardProps {
  balance: number;
  income: number;
  expenses: number;
}

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export function FinanceSummaryCard({ balance, income, expenses }: FinanceSummaryCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <LinearGradient
      colors={
        isDark
          ? ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0)']
          : ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0)']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.card, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
    >
      <View style={styles.balanceRow}>
        <View style={[styles.iconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
          <Icon name={IconWallet} size={18} color={colors.subtext} />
        </View>
        <View style={styles.balanceText}>
          <AppText style={[styles.balanceLabel, { color: colors.subtext }]}>Balance</AppText>
          <AppText bold style={[styles.balanceValue, { color: balance >= 0 ? colors.text : colors.error }]}>
            {formatMoney(balance)}
          </AppText>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
          <Icon name={IconTrendingUp} size={15} color="#34C759" />
          <AppText bold style={[styles.statValue, { color: colors.text }]}>{formatMoney(income)}</AppText>
        </View>
        <View style={[styles.statItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
          <Icon name={IconTrendingDown} size={15} color="#FF3B30" />
          <AppText bold style={[styles.statValue, { color: colors.text }]}>{formatMoney(expenses)}</AppText>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
    gap: 16,
    overflow: 'hidden',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceText: {
    gap: 1,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  balanceValue: {
    fontSize: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statValue: {
    fontSize: 14,
  },
});