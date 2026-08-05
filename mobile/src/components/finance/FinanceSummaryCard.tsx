import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
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
  const { colors, entityColors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.balanceSection}>
        <View style={[styles.balanceIconWrap, { backgroundColor: `${entityColors.finance}14` }]}>
          <Icon name={IconWallet} size={20} color={entityColors.finance} />
        </View>
        <View>
          <AppText style={[styles.balanceLabel, { color: colors.subtext }]}>Total Balance</AppText>
          <AppText bold style={[styles.balanceValue, { color: balance >= 0 ? colors.text : colors.error }]}>
            {formatMoney(balance)}
          </AppText>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statIconWrap, { backgroundColor: 'rgba(52, 199, 89, 0.12)' }]}>
            <Icon name={IconTrendingUp} size={16} color="#34C759" />
          </View>
          <View>
            <AppText style={[styles.statLabel, { color: colors.subtext }]}>Income</AppText>
            <AppText bold style={[styles.statValue, { color: '#34C759' }]}>
              {formatMoney(income)}
            </AppText>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIconWrap, { backgroundColor: 'rgba(255, 59, 48, 0.12)' }]}>
            <Icon name={IconTrendingDown} size={16} color="#FF3B30" />
          </View>
          <View>
            <AppText style={[styles.statLabel, { color: colors.subtext }]}>Expenses</AppText>
            <AppText bold style={[styles.statValue, { color: '#FF3B30' }]}>
              {formatMoney(expenses)}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  balanceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  balanceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  balanceValue: {
    fontSize: 28,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statValue: {
    fontSize: 16,
    marginTop: 1,
  },
});
