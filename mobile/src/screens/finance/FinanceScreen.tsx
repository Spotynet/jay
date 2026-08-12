import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { View } from 'react-native';
import ScreenLayout from '../../components/common/ScreenLayout';
import SegmentedTabs from '../../components/common/SegmentedTabs';
import { ActionButton } from '../../components/common/ActionButton';
import TransactionsTab from './TransactionsTab';
import BudgetTab from './BudgetTab';
import {
  getTransactions,
  getCategories,
  deleteTransaction,
  deleteCategory,
} from '../../api/finance';
import { IconPlus, IconFolder, IconWallet } from 'tabler-icons-react-native';
import { CreateNewModal } from '../today/components/CreateNewModal';

export default function FinanceScreen() {
  const { entityColors } = useTheme();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const accent = entityColors.finance;

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [activeTab, setActiveTab] = useState('Transactions');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [freeSpendBudget, setFreeSpendBudget] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [t, c, stored] = await Promise.all([
        getTransactions(),
        getCategories(),
        AsyncStorage.getItem('@jay_free_spend_amount'),
      ]);
      setTransactions(Array.isArray(t) ? t : []);
      setCategories(Array.isArray(c) ? c : []);
      if (stored != null) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed)) setFreeSpendBudget(parsed);
      }
    } catch (err) {
      console.error('Failed to fetch finance data', err);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused, month, year]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const categoryMapObj = categories.reduce((map: any, c: any) => {
    map[c.id] = c;
    if (Array.isArray(c.children)) {
      c.children.forEach((ch: any) => {
        map[ch.id] = ch;
      });
    }
    return map;
  }, {});

  const filteredTransactions = transactions.filter((t) => {
    const [ty, tm] = String(t.date).split('-').map(Number);
    return ty === year && tm === month + 1;
  });

  const periodIncome = filteredTransactions
    .filter((t) => t.type === 'EARNING')
    .reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const periodExpenses = filteredTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((s, t) => s + parseFloat(t.amount || 0), 0);

  const categoryExpenses = filteredTransactions
    .filter((t) => t.type === 'EXPENSE' && t.category)
    .reduce((map: Record<number, number>, t) => {
      map[t.category] = (map[t.category] || 0) + parseFloat(t.amount || 0);
      return map;
    }, {});

  const defaultCategoryIds = categories.filter((c: any) => c.is_default).map((c: any) => c.id);
  const freeSpendExpenses = filteredTransactions
    .filter((t) => t.type === 'EXPENSE' && (!t.category || defaultCategoryIds.includes(t.category)))
    .reduce((s, t) => s + parseFloat(t.amount || 0), 0);

  const transactionsUpToMonth = transactions.filter((t) => {
    const [ty, tm] = String(t.date).split('-').map(Number);
    if (ty < year) return true;
    if (ty === year && tm <= month + 1) return true;
    return false;
  });
  const runningBalance = transactionsUpToMonth.reduce((s, t) => {
    const amt = parseFloat(t.amount || 0);
    return s + (t.type === 'EARNING' ? amt : -amt);
  }, 0);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else setMonth(month + 1);
  };

  const handleDeleteTransaction = async (t: any) => {
    try {
      await deleteTransaction(t.id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete transaction', err);
    }
  };

  const handleDeleteCategory = async (c: any) => {
    try {
      await deleteCategory(c.id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete category', err);
    }
  };

  const handleHeaderPlus = () => {
    if (activeTab === 'Budget') {
      setShowCreateMenu(true);
    } else {
      navigation.navigate('TransactionEntry');
    }
  };

  const periodProps = {
    month,
    year,
    onPrev: prevMonth,
    onNext: nextMonth,
  };

  return (
    <ScreenLayout
      title="FINANCIAL"
      contentStyle={{ paddingHorizontal: 0 }}
      rightOption={{
        render: () => (
          <View style={styles.headerBtns}>
            <ActionButton icon={IconPlus} onPress={handleHeaderPlus} size={40} />
          </View>
        ),
      }}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />}
      >
        <SegmentedTabs
          tabs={['Transactions', 'Budget']}
          active={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'Transactions' ? (
          <TransactionsTab
            filteredTransactions={filteredTransactions}
            categoryMapObj={categoryMapObj}
            periodIncome={periodIncome}
            periodExpenses={periodExpenses}
            runningBalance={runningBalance}
            {...periodProps}
            onDeleteTransaction={handleDeleteTransaction}
          />
        ) : (
          <BudgetTab
            categories={categories}
            periodExpenses={periodExpenses}
            periodIncome={periodIncome}
            categoryExpenses={categoryExpenses}
            freeSpendExpenses={freeSpendExpenses}
            freeSpendBudget={freeSpendBudget}
            {...periodProps}
            onDeleteCategory={handleDeleteCategory}
            onFreeSpendChange={setFreeSpendBudget}
          />
        )}
      </ScrollView>

      <CreateNewModal
        visible={showCreateMenu}
        onClose={() => setShowCreateMenu(false)}
        title="Creation Hub"
        options={[
          { id: 'Category', label: 'NEW CATEGORY', sub: 'CREATE A GROUP', icon: IconFolder, color: accent },
          { id: 'Item', label: 'NEW ITEM', sub: 'TRACKED ITEM', icon: IconWallet, color: accent },
        ]}
        onSelect={(id) => {
          setShowCreateMenu(false);
          if (id === 'Item') navigation.navigate('CategoryItemEntry');
          else navigation.navigate('CategoryEntry');
        }}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 15,
    paddingTop: 16,
    gap: 16,
  },
  headerBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
