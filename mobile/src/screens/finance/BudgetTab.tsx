import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import SectionCard from '../../components/common/SectionCard';
import SwipeDelete from '../../components/common/SwipeDelete';
import { PeriodSelector } from '../../components/finance/PeriodSelector';
import { BudgetFillChart } from '../../components/finance/BudgetFillChart';
import FreeSpendCard from '../../components/finance/FreeSpendCard';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { IconPlus, IconArrowRight, IconFolder } from 'tabler-icons-react-native';
import { FINANCE_ICONS } from '../../constants/financeIcons';

const resolveIcon = (name?: string) =>
  (name && FINANCE_ICONS.find((i) => i.name === name)?.icon) || IconFolder;

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const formatCompact = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);

interface BudgetTabProps {
  categories: any[];
  periodExpenses: number;
  periodIncome: number;
  categoryExpenses: Record<number, number>;
  freeSpendExpenses: number;
  freeSpendBudget: number;
  month: number;
  year: number;
  onPrev: () => void;
  onNext: () => void;
  onDeleteCategory: (c: any) => void;
  onFreeSpendChange?: (amount: number) => void;
}

export default function BudgetTab({
  categories,
  periodExpenses,
  periodIncome,
  categoryExpenses,
  freeSpendExpenses,
  freeSpendBudget,
  month,
  year,
  onPrev,
  onNext,
  onDeleteCategory,
  onFreeSpendChange,
}: BudgetTabProps) {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();

  const spentOf = (cat: any) => categoryExpenses[cat.id] || 0;
  const budgetOf = (cat: any) => parseFloat(String(cat.budget || 0));
  const childrenOf = (cat: any) => (Array.isArray(cat.children) ? cat.children : []);

  const budgetCategories = categories.filter((c: any) => !c.is_default);

  const totalBudget = budgetCategories
    .filter((c: any) => c.type === 'EXPENSE')
    .reduce((sum: number, c: any) => {
      const children = childrenOf(c);
      if (children.length > 0) {
        return sum + children.reduce((s: number, ch: any) => s + budgetOf(ch), 0);
      }
      return sum + budgetOf(c);
    }, 0) + freeSpendBudget;

  const gradient = (
    isDark
      ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']
      : ['rgba(0,0,0,0.04)', 'rgba(0,0,0,0)']
  ) as [string, string];

  const renderCategorySection = (cat: any, index: number) => {
    const children = childrenOf(cat);
    const parentSpent = children.reduce((s: number, ch: any) => s + spentOf(ch), 0);
    const parentBudget = children.reduce((s: number, ch: any) => s + budgetOf(ch), 0);
    const parentPct = parentBudget > 0 ? Math.max(0, Math.min(parentSpent / parentBudget, 1)) : 0;
    const parentOver = parentBudget > 0 && parentSpent > parentBudget;
    const sectionColor = cat.color || colors.border;
    const sectionIcon = cat.icon ? resolveIcon(cat.icon) : IconFolder;

    return (
      <Animated.View key={cat.id} entering={FadeInDown.duration(300).delay(index * 80)}>
        <View style={styles.section}>
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <TouchableOpacity
              style={styles.sectionHeaderLeft}
              onPress={() => navigation.navigate('CategoryEntry', { category: cat })}
              activeOpacity={0.7}
            >
              <View style={[styles.sectionIcon, { backgroundColor: `${sectionColor}1A` }]}>
                <Icon name={sectionIcon} size={16} color={sectionColor} />
              </View>
              <View>
                <AppText bold style={[styles.sectionName, { color: colors.text }]}>{cat.name}</AppText>
                <AppText style={[styles.sectionMeta, { color: colors.subtext }]}>
                  {children.length} {children.length === 1 ? 'item' : 'items'}
                </AppText>
              </View>
            </TouchableOpacity>
            <View style={styles.sectionHeaderRight}>
              {parentBudget > 0 && (
                <View style={styles.sectionAmounts}>
                  <AppText style={[styles.sectionPaid, { color: sectionColor }]}>
                    {formatCompact(parentSpent)}
                  </AppText>
                  <AppText style={[styles.sectionTotal, { color: colors.subtext }]}>
                    / {formatCompact(parentBudget)}
                  </AppText>
                </View>
              )}
              <TouchableOpacity
                style={styles.sectionAdd}
                onPress={() =>
                  navigation.navigate('CategoryItemEntry', {
                    parent: { id: cat.id, name: cat.name, type: cat.type },
                  })
                }
                hitSlop={6}
                activeOpacity={0.7}
              >
                <Icon name={IconPlus} size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section Progress */}
          {parentBudget > 0 && (
            <View style={styles.sectionProgress}>
              <View style={styles.sectionProgressHeader}>
                <AppText style={[styles.sectionProgressLabel, { color: colors.subtext }]}>
                  {formatCompact(parentSpent)} / {formatCompact(parentBudget)}
                </AppText>
                <AppText style={[styles.sectionProgressPct, { color: parentOver ? colors.error : colors.subtext }]}>
                  {Math.round(parentPct * 100)}%
                </AppText>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.surfaceElevated }]}>
                <LinearGradient
                  colors={parentOver ? [colors.error, colors.error + 'CC'] : [sectionColor, sectionColor + '99']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${parentPct * 100}%` }]}
                />
              </View>
            </View>
          )}

          {/* Items */}
          {children.length > 0 ? (
            <View style={styles.itemsList}>
              {children.map((item: any, i: number) => {
                const itemSpent = spentOf(item);
                const itemBudget = budgetOf(item);
                const itemPct = itemBudget > 0 ? Math.max(0, Math.min(itemSpent / itemBudget, 1)) : 0;
                const itemOver = itemBudget > 0 && itemSpent > itemBudget;
                const itemColor = item.color || sectionColor;

                return (
                  <SwipeDelete key={item.id} onDelete={() => onDeleteCategory(item)}>
                    <TouchableOpacity
                      style={[
                        styles.itemRow,
                        i < children.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border + '30' },
                      ]}
                      onPress={() => navigation.navigate('CategoryItemEntry', { item })}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.itemDot, { backgroundColor: itemColor }]} />
                      <View style={styles.itemContent}>
                        <View style={styles.itemHeader}>
                          <AppText style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                            {item.name}
                          </AppText>
                          {itemBudget > 0 && (
                            <AppText style={[styles.itemAmount, { color: colors.subtext }]}>
                              {formatCompact(itemSpent)} / {formatCompact(itemBudget)}
                            </AppText>
                          )}
                        </View>
                        {itemBudget > 0 && (
                          <View style={[styles.progressTrack, { backgroundColor: colors.surfaceElevated }]}>
                            <LinearGradient
                              colors={itemOver ? [colors.error, colors.error + 'CC'] : [itemColor, itemColor + '99']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={[styles.progressFill, { width: `${itemPct * 100}%` }]}
                            />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </SwipeDelete>
                );
              })}
            </View>
          ) : (
            <AppText style={[styles.emptyItems, { color: colors.subtext }]}>
              No items yet
            </AppText>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <PeriodSelector month={month} year={year} onPrev={onPrev} onNext={onNext} />

      <SectionCard title="BUDGET" cardStyle={{ paddingTop: 4 }}>
        <View style={styles.totalRow}>
          <AppText style={[styles.totalLabel, { color: colors.subtext }]}>Total Budget</AppText>
          <AppText bold style={[styles.totalValue, { color: colors.text }]}>
            {formatMoney(totalBudget)}
          </AppText>
        </View>

        <View style={styles.totalRow}>
          <AppText style={[styles.totalLabel, { color: colors.subtext }]}>Total Income</AppText>
          <AppText style={[styles.totalValue, { color: colors.text }]}>
            {formatMoney(periodIncome)}
          </AppText>
        </View>

        <View style={styles.totalRow}>
          <AppText style={[styles.totalLabel, { color: colors.subtext }]}>Total Spent</AppText>
          <AppText style={[styles.totalValue, { color: colors.text }]}>
            {formatMoney(periodExpenses)}
          </AppText>
        </View>

        <BudgetFillChart spent={periodExpenses} totalBudget={totalBudget} income={periodIncome} />
      </SectionCard>

      <SectionCard title="CATEGORIES" cardStyle={{ paddingTop: 4 }}>
        <FreeSpendCard spent={freeSpendExpenses} onAmountChange={onFreeSpendChange} />
        {budgetCategories.length > 0 ? (
          budgetCategories.map((cat, i) => renderCategorySection(cat, i))
        ) : (
          <AppText style={[styles.emptySection, { color: colors.subtext }]}>No categories yet</AppText>
        )}
      </SectionCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  emptySection: {
    fontSize: 13,
    paddingVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionName: {
    fontSize: 14,
    letterSpacing: 0.3,
  },
  sectionMeta: {
    fontSize: 11,
    marginTop: 1,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  sectionPaid: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTotal: {
    fontSize: 11,
    fontWeight: '500',
  },
  sectionAdd: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionProgress: {
    marginBottom: 10,
  },
  sectionProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionProgressLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionProgressPct: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  itemsList: {
    gap: 0,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  itemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemContent: {
    flex: 1,
    gap: 6,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  itemAmount: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyItems: {
    fontSize: 12,
    paddingVertical: 12,
    textAlign: 'center',
  },
});