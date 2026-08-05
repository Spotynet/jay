import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import ScreenLayout from '../../components/common/ScreenLayout';
import { FinanceSummaryCard } from '../../components/finance/FinanceSummaryCard';
import { BudgetProgressCard } from '../../components/finance/BudgetProgressCard';
import { TransactionRow } from '../../components/finance/TransactionRow';
import { PeriodSelector } from '../../components/finance/PeriodSelector';
import { getTransactions, getAccounts, getBudgets, getCategories } from '../../api/finance';

import { IconSettings, IconPlus, IconPencil, IconChartBar, IconArrowRight } from 'tabler-icons-react-native';

export default function FinanceScreen() {
  const { colors, entityColors } = useTheme();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();


  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [tData, aData, bData, cData] = await Promise.all([
        getTransactions(),
        getAccounts(),
        getBudgets(),
        getCategories(),
      ]);
      setTransactions(Array.isArray(tData) ? tData : []);
      setAccounts(Array.isArray(aData) ? aData : []);
      setBudgets(Array.isArray(bData) ? bData : []);
      setCategories(Array.isArray(cData) ? cData : []);
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

  const totalBalance = accounts.reduce((acc, curr) => acc + parseFloat(curr.initial_balance || 0), 0);

  const periodIncome = filteredTransactions
    .filter((t) => t.type === 'EARNING')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const periodExpenses = filteredTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const periodBalance = totalBalance + periodIncome - periodExpenses;

  const categoryMap = categories.reduce((map: any, c: any) => {
    map[c.id] = c;
    return map;
  }, {});

  const categorySpending = filteredTransactions
    .filter((t) => t.type === 'EXPENSE' && t.category)
    .reduce((map: any, t) => {
      const catId = t.category;
      map[catId] = (map[catId] || 0) + parseFloat(t.amount || 0);
      return map;
    }, {});

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const recentTransactions = filteredTransactions.slice(0, 10);

  return (
    <ScreenLayout
        title="FINANCIAL"
        rightOption={{
          render: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <TouchableOpacity onPress={() => navigation.navigate('FinanceSettings')} style={styles.headerBtn}>
                <Icon name={IconSettings} size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('TransactionEntry')} style={styles.headerBtn}>
                <Icon name={IconPlus} size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
        contentStyle={{ paddingHorizontal: 0 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.subtext} />}
        >
          <View style={styles.periodPad}>
            <PeriodSelector month={month} year={year} onPrev={prevMonth} onNext={nextMonth} />
          </View>

          <View style={styles.sectionPad}>
            <FinanceSummaryCard balance={periodBalance} income={periodIncome} expenses={periodExpenses} />
          </View>

          {budgets.length > 0 && (
            <View style={styles.sectionPad}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Icon name={IconChartBar} size={16} color={entityColors.finance} />
                  <AppText bold style={[styles.sectionTitle, { color: colors.subtext }]}>BUDGETS</AppText>
                </View>
              </View>
              {budgets.slice(0, 3).map((budget: any) => {
                const cat = categoryMap[budget.category];
                const spent = categorySpending[budget.category] || 0;
                return (
                  <BudgetProgressCard
                    key={budget.id}
                    title={cat?.name || 'Budget'}
                    spent={spent}
                    limit={parseFloat(budget.amount)}
                  />
                );
              })}
            </View>
          )}

          <View style={styles.sectionPad}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <AppText bold style={[styles.sectionTitle, { color: colors.subtext }]}>TRANSACTIONS</AppText>
                {filteredTransactions.length > 10 && (
                  <TouchableOpacity onPress={() => navigation.navigate('ManageFinance')} style={styles.seeAllBtn}>
                    <AppText style={[styles.seeAll, { color: entityColors.finance }]}>See All</AppText>
                    <Icon name={IconArrowRight} size={14} color={entityColors.finance} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {recentTransactions.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <AppText style={[styles.emptyText, { color: colors.subtext }]}>
                  No transactions this month
                </AppText>
                <TouchableOpacity
                  onPress={() => navigation.navigate('TransactionEntry')}
                  style={[styles.emptyButton, { backgroundColor: `${entityColors.finance}14` }]}
                >
                  <Icon name={IconPlus} size={16} color={entityColors.finance} />
                  <AppText bold style={[styles.emptyButtonText, { color: entityColors.finance }]}>
                    Add Transaction
                  </AppText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.transactionsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {recentTransactions.map((t, i) => (
                  <TransactionRow
                    key={t.id}
                    description={t.description || categoryMap[t.category]?.name || 'Transaction'}
                    amount={parseFloat(t.amount)}
                    type={t.type}
                    date={t.date}
                    category={categoryMap[t.category]?.name}
                    isLast={i === recentTransactions.length - 1}
                  />
                ))}
              </View>
            )}
          </View>

          {accounts.length > 0 && (
            <View style={styles.sectionPad}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <AppText bold style={[styles.sectionTitle, { color: colors.subtext }]}>ACCOUNTS</AppText>
                </View>
              </View>
              <View style={[styles.accountsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {accounts.map((acc: any, i: number) => (
                  <View key={acc.id} style={[styles.accountRow, i < accounts.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                    <AppText style={[styles.accountName, { color: colors.text }]}>{acc.name}</AppText>
                    <AppText bold style={[styles.accountBalance, { color: colors.text }]}>
                      ${parseFloat(acc.initial_balance || 0).toFixed(2)}
                    </AppText>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerBtn: { padding: 8 },
  scrollContent: { paddingBottom: 20 },
  periodPad: { paddingHorizontal: 20 },
  sectionPad: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 13,
  },
  transactionsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accountsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
  },
  accountBalance: {
    fontSize: 15,
  },
});
