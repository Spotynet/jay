import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import ScreenLayout from '../../components/common/ScreenLayout';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { FinanceSummaryCard } from '../../components/finance/FinanceSummaryCard';
import { TransactionRow } from '../../components/finance/TransactionRow';
import { PeriodSelector } from '../../components/finance/PeriodSelector';
import { getTransactions, getFinanceEntries } from '../../api/finance';
import { IconWallet } from 'tabler-icons-react-native';

export default function ManageFinanceScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { colors, entityColors } = useTheme();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [transactions, setTransactions] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [t, e] = await Promise.all([getTransactions(), getFinanceEntries()]);
      setTransactions(Array.isArray(t) ? t : []);
      setEntries(Array.isArray(e) ? e : []);
    } catch (e) {
      console.error('Failed to fetch finance data', e);
    }
  }, []);

  useEffect(() => {
    if (isFocused) fetchData();
  }, [isFocused, fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const filteredTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const filteredEntries = entries.filter((e) => {
    if (!e.date) return true;
    const d = new Date(e.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const periodIncome = filteredTransactions
    .filter((t) => t.type === 'EARNING')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const periodExpenses = filteredTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const entryIncome = filteredEntries
    .filter((e) => e.type === 'INCOME')
    .reduce((sum, e) => sum + parseFloat(e.value || e.amount || 0), 0);

  const entryExpenses = filteredEntries
    .filter((e) => e.type === 'EXPENSE')
    .reduce((sum, e) => sum + parseFloat(e.value || e.amount || 0), 0);

  const totalIncome = periodIncome + entryIncome;
  const totalExpenses = periodExpenses + entryExpenses;
  const balance = totalIncome - totalExpenses;

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const allItems = [
    ...filteredTransactions.map((t) => ({
      id: `t-${t.id}`,
      type: t.type === 'EARNING' ? 'INCOME' as const : 'EXPENSE' as const,
      amount: parseFloat(t.amount || 0),
      description: t.description || 'Transaction',
      date: t.date,
      kind: 'transaction' as const,
    })),
    ...filteredEntries.map((e) => ({
      id: `e-${e.id}`,
      type: e.type as 'INCOME' | 'EXPENSE',
      amount: parseFloat(e.value || e.amount || 0),
      description: e.name || 'Entry',
      date: e.date || e.created_at,
      kind: 'entry' as const,
    })),
  ].sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return db - da;
  });

  return (
    <ScreenLayout title="FINANCE HISTORY" showBack={true}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.subtext} />}
      >
        <PeriodSelector month={month} year={year} onPrev={prevMonth} onNext={nextMonth} />

        <FinanceSummaryCard balance={balance} income={totalIncome} expenses={totalExpenses} />

        <View style={styles.sectionHeader}>
          <AppText bold style={[styles.sectionTitle, { color: colors.subtext }]}>ALL TRANSACTIONS</AppText>
        </View>

        {allItems.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Icon name={IconWallet} size={32} color={colors.subtext} />
            <AppText style={[styles.emptyText, { color: colors.subtext }]}>
              No transactions this month
            </AppText>
          </View>
        ) : (
          <View style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {allItems.map((item, i) => (
              <TransactionRow
                key={item.id}
                description={item.description}
                amount={item.amount}
                type={item.type === 'INCOME' ? 'EARNING' : 'EXPENSE'}
                date={item.date || 'No date'}
                isLast={i === allItems.length - 1}
              />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  listCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
