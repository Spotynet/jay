import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { AppText } from '../../components/ui/AppText';
import SectionCard from '../../components/common/SectionCard';
import SwipeDelete from '../../components/common/SwipeDelete';
import { FinanceSummaryCard } from '../../components/finance/FinanceSummaryCard';
import { TransactionRow } from '../../components/finance/TransactionRow';
import { PeriodSelector } from '../../components/finance/PeriodSelector';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { parseLocalDate } from '../../utils/date';

interface TransactionsTabProps {
  filteredTransactions: any[];
  categoryMapObj: Record<number, any>;
  periodIncome: number;
  periodExpenses: number;
  runningBalance: number;
  month: number;
  year: number;
  onPrev: () => void;
  onNext: () => void;
  onDeleteTransaction: (t: any) => void;
}

export default function TransactionsTab({
  filteredTransactions,
  categoryMapObj,
  periodIncome,
  periodExpenses,
  runningBalance,
  month,
  year,
  onPrev,
  onNext,
  onDeleteTransaction,
}: TransactionsTabProps) {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const sorted = [...filteredTransactions].sort((a, b) => {
    const dateDiff = parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return (b.id || 0) - (a.id || 0);
  });

  return (
    <View style={styles.container}>
      <PeriodSelector month={month} year={year} onPrev={onPrev} onNext={onNext} />
      <FinanceSummaryCard balance={runningBalance} income={periodIncome} expenses={periodExpenses} />

      {sorted.length === 0 ? (
        <AppText style={[styles.empty, { color: colors.subtext }]}>No transactions this month</AppText>
      ) : (
        <SectionCard
          title="TRANSACTIONS"
          cardStyle={{ paddingVertical: 4, paddingHorizontal: 0 }}
          accessory={
            <AppText style={[styles.count, { color: colors.subtext }]}>
              {sorted.length}
            </AppText>
          }
        >
          {sorted.map((t, i) => {
            const subCat = t.subcategory ? categoryMapObj[t.subcategory] : null;
            const parentCat = t.category ? categoryMapObj[t.category] : null;
            const subName = subCat?.name || '';
            const parentName = parentCat?.name || '';
            const freeLabel = !subCat ? (t.type === 'EXPENSE' ? 'Free expense' : '') : '';
            return (
              <Animated.View key={`t-${t.id}`} entering={FadeInDown.duration(280).delay(i * 25)}>
                <SwipeDelete onDelete={() => onDeleteTransaction(t)}>
                  <TransactionRow
                    description={t.description || subName || freeLabel || 'Transaction'}
                    amount={parseFloat(t.amount)}
                    type={t.type}
                    date={t.date}
                    parentCategory={parentName}
                    iconName={subCat?.icon}
                    iconColor={subCat?.color}
                    isLast={i === sorted.length - 1}
                    onPress={() => navigation.navigate('TransactionDetail', { transaction: t, categoryMapObj })}
                  />
                </SwipeDelete>
              </Animated.View>
            );
          })}
        </SectionCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  count: {
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    fontSize: 13,
    paddingVertical: 24,
    textAlign: 'center',
  },
});