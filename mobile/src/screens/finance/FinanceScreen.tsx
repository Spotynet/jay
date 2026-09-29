import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { View } from 'react-native';
import ScreenLayout from '../../components/common/ScreenLayout';
import SegmentedTabs from '../../components/common/SegmentedTabs';
import { ActionButton } from '../../components/common/ActionButton';
import TransactionsTab from './TransactionsTab';
import BudgetTab from './BudgetTab';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import {
  getTransactions,
  getCategories,
  deleteTransaction,
  deleteCategory,
} from '../../api/finance';
import { IconPlus, IconFolder, IconWallet, IconArrowsSort, IconHandMove, IconCheck, IconX } from 'tabler-icons-react-native';
import { CreateNewModal } from '../today/components/CreateNewModal';

export default function FinanceScreen() {
  const { entityColors, colors } = useTheme();
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
  const [refreshing, setRefreshing] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [t, c] = await Promise.all([
        getTransactions(),
        getCategories(),
      ]);
      setTransactions(Array.isArray(t) ? t : []);
      setCategories(Array.isArray(c) ? c : []);
      setHasUnsavedChanges(false);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch finance data', err);
      setError("Couldn't load your finances.");
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused, month, year]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (!isReorderMode || !hasUnsavedChanges) return;

      e.preventDefault();

      Alert.alert(
        'Unsaved Changes',
        'You have unsaved reordering changes. What would you like to do?',
        [
          { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
          { text: 'Keep Editing', style: 'cancel', onPress: () => {} },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, isReorderMode, hasUnsavedChanges]);

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
    .filter((t) => t.type === 'EXPENSE' && (t.category || t.subcategory))
    .reduce((map: Record<number, number>, t) => {
      const leafId = t.subcategory || t.category;
      map[leafId] = (map[leafId] || 0) + parseFloat(t.amount || 0);
      return map;
    }, {});

  const categoryEarnings = filteredTransactions
    .filter((t) => t.type === 'EARNING' && (t.category || t.subcategory))
    .reduce((map: Record<number, number>, t) => {
      const leafId = t.subcategory || t.category;
      map[leafId] = (map[leafId] || 0) + parseFloat(t.amount || 0);
      return map;
    }, {});

  // All-time expenses per category (for debt tracking)
  const allTimeCategoryExpenses = transactions
    .filter((t) => t.type === 'EXPENSE' && (t.category || t.subcategory))
    .reduce((map: Record<number, number>, t) => {
      const leafId = t.subcategory || t.category;
      map[leafId] = (map[leafId] || 0) + parseFloat(t.amount || 0);
      return map;
    }, {});

  const totalEarned = filteredTransactions
    .filter((t) => t.type === 'EARNING')
    .reduce((s, t) => s + parseFloat(t.amount || 0), 0);

  const totalEarningsBudget = categories
    .filter((c: any) => c.type === 'EARNING')
    .reduce((sum: number, c: any) => {
      const children = Array.isArray(c.children) ? c.children : [];
      if (children.length > 0) {
        return sum + children.reduce((s: number, ch: any) => s + parseFloat(String(ch.budget || 0)), 0);
      }
      return sum + parseFloat(String(c.budget || 0));
    }, 0);

  const defaultCategoryIds = categories.filter((c: any) => c.is_default).map((c: any) => c.id);
  const freeSpendExpenses = filteredTransactions
    .filter((t) => t.type === 'EXPENSE' && (!t.category || defaultCategoryIds.includes(t.category)))
    .reduce((s, t) => s + parseFloat(t.amount || 0), 0);

  // Free spend budget = total budgeted earnings - total budgeted expenses
  const totalExpensesBudget = categories
    .filter((c: any) => c.type === 'EXPENSE' && !c.is_default)
    .reduce((sum: number, c: any) => {
      const children = Array.isArray(c.children) ? c.children : [];
      const activeChildren = children.filter((ch: any) => ch.is_active !== false);
      if (activeChildren.length > 0) {
        return sum + activeChildren.reduce((s: number, ch: any) => s + parseFloat(String(ch.budget || 0)), 0);
      }
      return sum + parseFloat(String(c.budget || 0));
    }, 0);
  const computedFreeSpendBudget = totalEarningsBudget - totalExpensesBudget;

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
      setError(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete transaction', err);
      setError("Couldn't delete this transaction.");
    }
  };

  const handleDeleteCategory = async (c: any) => {
    try {
      await deleteCategory(c.id);
      setError(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete category', err);
      setError("Couldn't delete this category.");
    }
  };

  const handleHeaderPlus = () => {
    if (isReorderMode) return;
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

  const budgetTabRef = React.useRef<any>(null);

  const handleConfirmReorder = async () => {
    if (budgetTabRef.current?.saveReorder) {
      await budgetTabRef.current.saveReorder();
    }
    setIsReorderMode(false);
    setHasUnsavedChanges(false);
  };

  const handleCancelReorder = () => {
    setIsReorderMode(false);
    setHasUnsavedChanges(false);
    fetchData(); // Reset from server
  };

  return (
    <ScreenLayout
      title="FINANCIAL"
      contentStyle={{ paddingHorizontal: 0 }}
      rightOption={{
        render: () => (
          <View style={styles.headerBtns}>
            {activeTab === 'Budget' && (
              <>
                {isReorderMode ? (
                  <>
                    <ActionButton 
                      icon={IconX} 
                      onPress={handleCancelReorder} 
                      size={40}
                      color={colors.error}
                    />
                    <ActionButton 
                      icon={IconCheck} 
                      onPress={handleConfirmReorder} 
                      size={40}
                      color={colors.success || '#34C759'}
                    />
                  </>
                ) : (
                  <ActionButton 
                    icon={IconHandMove} 
                    onPress={() => setIsReorderMode(true)} 
                    size={40} 
                  />
                )}
              </>
            )}
            {!isReorderMode && (
              <ActionButton icon={IconPlus} onPress={handleHeaderPlus} size={40} />
            )}
          </View>
        ),
      }}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        scrollEnabled={!isDragging}
        showsVerticalScrollIndicator={false}
        refreshControl={!isReorderMode ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} /> : undefined}
      >
        <ErrorMessage message={error} />
        {!isReorderMode && (
          <SegmentedTabs
            tabs={['Transactions', 'Budget']}
            active={activeTab}
            onChange={setActiveTab}
          />
        )}

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
            ref={budgetTabRef}
            categories={categories}
            periodExpenses={periodExpenses}
            categoryExpenses={categoryExpenses}
            categoryEarnings={categoryEarnings}
            allTimeCategoryExpenses={allTimeCategoryExpenses}
            totalEarned={totalEarned}
            totalEarningsBudget={totalEarningsBudget}
            freeSpendExpenses={freeSpendExpenses}
            freeSpendBudget={computedFreeSpendBudget}
            isReorderMode={isReorderMode}
            setIsReorderMode={setIsReorderMode}
            setHasUnsavedChanges={setHasUnsavedChanges}
            onDragStateChange={setIsDragging}
            {...periodProps}
            onDeleteCategory={handleDeleteCategory}
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
    paddingBottom: 16,
    gap: 16,
  },
  headerBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
