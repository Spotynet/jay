import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import ScreenLayout from '../../components/common/ScreenLayout';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { AccountCard } from '../../components/finance/AccountCard';
import { CategoryChip } from '../../components/finance/CategoryChip';
import { BudgetProgressCard } from '../../components/finance/BudgetProgressCard';
import { getAccounts, getCategories, getBudgets, deleteAccount, deleteCategory, deleteBudget, getTransactions } from '../../api/finance';
import { IconPlus, IconWallet, IconTag, IconChartPie } from 'tabler-icons-react-native';
import DeleteConfirm from '../../components/ui/DeleteConfirm';

export default function FinanceSettingsScreen() {
  const { colors, entityColors } = useTheme();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [a, c, b, t] = await Promise.all([
        getAccounts(), getCategories(), getBudgets(), getTransactions(),
      ]);
      setAccounts(Array.isArray(a) ? a : []);
      setCategories(Array.isArray(c) ? c : []);
      setBudgets(Array.isArray(b) ? b : []);
      setTransactions(Array.isArray(t) ? t : []);
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

  const categorySpending = transactions
    .filter((t) => t.type === 'EXPENSE' && t.category)
    .reduce((map: any, t) => {
      map[t.category] = (map[t.category] || 0) + parseFloat(t.amount || 0);
      return map;
    }, {});

  const categoryMap = categories.reduce((map: any, c: any) => {
    map[c.id] = c;
    return map;
  }, {});

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'account') await deleteAccount(deleteTarget.id);
      else if (deleteTarget.type === 'category') await deleteCategory(deleteTarget.id);
      else if (deleteTarget.type === 'budget') await deleteBudget(deleteTarget.id);
      Alert.alert('Deleted', `${deleteTarget.type} removed`);
      fetchData();
    } catch (e) {
      Alert.alert('Error', `Failed to delete ${deleteTarget.type}`);
    } finally {
      setDeleteTarget(null);
    }
  };

  const SectionHeader = ({ title, icon, count, onAdd }: { title: string; icon: any; count: number; onAdd: () => void }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <Icon name={icon} size={16} color={entityColors.finance} />
        <AppText bold style={[styles.sectionTitle, { color: colors.subtext }]}>{title}</AppText>
        <View style={[styles.countBadge, { backgroundColor: `${entityColors.finance}14` }]}>
          <AppText style={[styles.countText, { color: entityColors.finance }]}>{count}</AppText>
        </View>
      </View>
      <TouchableOpacity onPress={onAdd} style={[styles.addBtn, { backgroundColor: `${entityColors.finance}14` }]}>
        <Icon name={IconPlus} size={16} color={entityColors.finance} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenLayout title="FINANCE SETTINGS" showBack={true}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.subtext} />}
      >
        {/* Accounts */}
        <SectionHeader title="ACCOUNTS" icon={IconWallet} count={accounts.length} onAdd={() => navigation.navigate('AccountEntry')} />
        <View style={styles.sectionContent}>
          {accounts.length === 0 ? (
            <TouchableOpacity
              style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border, borderStyle: 'dashed' }]}
              onPress={() => navigation.navigate('AccountEntry')}
            >
              <AppText style={[styles.emptyText, { color: colors.subtext }]}>No accounts yet</AppText>
            </TouchableOpacity>
          ) : (
            accounts.map((acc) => (
              <AccountCard
                key={acc.id}
                name={acc.name}
                balance={parseFloat(acc.initial_balance || 0)}
                onEdit={() => navigation.navigate('AccountEntry', { account: acc })}
                onDelete={() => setDeleteTarget({ type: 'account', id: acc.id })}
              />
            ))
          )}
        </View>

        {/* Categories */}
        <SectionHeader title="CATEGORIES" icon={IconTag} count={categories.length} onAdd={() => navigation.navigate('CategoryEntry')} />
        <View style={styles.sectionContent}>
          {categories.length === 0 ? (
            <TouchableOpacity
              style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border, borderStyle: 'dashed' }]}
              onPress={() => navigation.navigate('CategoryEntry')}
            >
              <AppText style={[styles.emptyText, { color: colors.subtext }]}>No categories yet</AppText>
            </TouchableOpacity>
          ) : (
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <CategoryChip
                  key={cat.id}
                  name={cat.name}
                  type={cat.type}
                  onEdit={() => navigation.navigate('CategoryEntry', { category: cat })}
                  onDelete={() => setDeleteTarget({ type: 'category', id: cat.id })}
                />
              ))}
            </View>
          )}
        </View>

        {/* Budgets */}
        <SectionHeader title="BUDGETS" icon={IconChartPie} count={budgets.length} onAdd={() => navigation.navigate('BudgetEntry')} />
        <View style={styles.sectionContent}>
          {budgets.length === 0 ? (
            <TouchableOpacity
              style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border, borderStyle: 'dashed' }]}
              onPress={() => navigation.navigate('BudgetEntry')}
            >
              <AppText style={[styles.emptyText, { color: colors.subtext }]}>No budgets set</AppText>
            </TouchableOpacity>
          ) : (
            budgets.map((b) => {
              const cat = categoryMap[b.category];
              const spent = categorySpending[b.category] || 0;
              return (
                <TouchableOpacity
                  key={b.id}
                  onLongPress={() => setDeleteTarget({ type: 'budget', id: b.id })}
                  activeOpacity={0.8}
                >
                  <BudgetProgressCard
                    title={cat?.name || 'Budget'}
                    spent={spent}
                    limit={parseFloat(b.amount)}
                  />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <DeleteConfirm visible={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
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
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  categoryGrid: {
    gap: 8,
  },
});
