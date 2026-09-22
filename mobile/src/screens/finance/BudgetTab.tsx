import React, { useEffect, useState, useCallback } from 'react';
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
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, runOnJS, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { IconPlus, IconFolder, IconWallet, IconGripVertical, IconEyeOff } from 'tabler-icons-react-native';
import { FINANCE_ICONS } from '../../constants/financeIcons';
import { reorderCategories } from '../../api/finance';

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
  categoryExpenses: Record<number, number>;
  categoryEarnings: Record<number, number>;
  allTimeCategoryExpenses: Record<number, number>;
  totalEarned: number;
  totalEarningsBudget: number;
  freeSpendExpenses: number;
  freeSpendBudget: number;
  isReorderMode: boolean;
  setIsReorderMode: (val: boolean) => void;
  setHasUnsavedChanges: (val: boolean) => void;
  onDragStateChange?: (isDragging: boolean) => void;
  month: number;
  year: number;
  onPrev: () => void;
  onNext: () => void;
  onDeleteCategory: (c: any) => void;
}

function DraggableGroup({
  cat,
  index,
  total,
  onMove,
  isReordering,
  onDragStateChange,
  children,
}: {
  cat: any;
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  isReordering: boolean;
  onDragStateChange?: (active: boolean) => void;
  children: React.ReactNode;
}) {
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const cardHeight = useSharedValue(180);
  const { colors } = useTheme();

  const gesture = Gesture.Pan()
    .enabled(isReordering)
    .activateAfterLongPress(220)
    .activeOffsetY([-8, 8])
    .failOffsetX([-12, 12])
    .onStart(() => {
      isDragging.value = true;
      if (onDragStateChange) runOnJS(onDragStateChange)(true);
    })
    .onUpdate((e) => {
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      const delta = translateY.value;
      const shift = Math.round(delta / Math.max(cardHeight.value, 100));
      const target = Math.min(Math.max(index + shift, 0), total - 1);
      if (target !== index) {
        runOnJS(onMove)(index, target);
      }
      translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
      isDragging.value = false;
      if (onDragStateChange) runOnJS(onDragStateChange)(false);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value }, 
      { scale: isDragging.value ? 1.02 : 1 }
    ] as any,
    zIndex: isDragging.value ? 10 : 0,
    elevation: isDragging.value ? 6 : 0,
    shadowOpacity: isDragging.value ? 0.15 : 0,
    shadowRadius: isDragging.value ? 8 : 0,
  }));

  return (
    <Animated.View
      onLayout={(e) => {
        cardHeight.value = e.nativeEvent.layout.height || 180;
      }}
      style={[animatedStyle]}
      entering={FadeInDown.duration(300).delay(index * 60)}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 0 }}>
        {total > 1 && isReordering && (
          <GestureDetector gesture={gesture}>
            <View style={[styles.groupDragHandle, { borderColor: colors.border + '30' }]}>
              <Icon name={IconGripVertical} size={14} color={colors.subtext} />
            </View>
          </GestureDetector>
        )}
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    </Animated.View>
  );
}

function DraggableItem({
  parentId,
  index,
  total,
  onMove,
  isReordering,
  onDragStateChange,
  children,
}: {
  parentId: number;
  index: number;
  total: number;
  onMove: (parentId: number, from: number, to: number) => void;
  isReordering: boolean;
  onDragStateChange?: (active: boolean) => void;
  children: React.ReactNode;
}) {
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const rowHeight = useSharedValue(64);
  const { colors } = useTheme();

  const gesture = Gesture.Pan()
    .enabled(isReordering)
    .activateAfterLongPress(200)
    .activeOffsetY([-6, 6])
    .failOffsetX([-10, 10])
    .onStart(() => {
      isDragging.value = true;
      if (onDragStateChange) runOnJS(onDragStateChange)(true);
    })
    .onUpdate((e) => {
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      const delta = translateY.value;
      const shift = Math.round(delta / Math.max(rowHeight.value, 48));
      const target = Math.min(Math.max(index + shift, 0), total - 1);
      if (target !== index) {
        runOnJS(onMove)(parentId, index, target);
      }
      translateY.value = withSpring(0, { damping: 18, stiffness: 260 });
      isDragging.value = false;
      if (onDragStateChange) runOnJS(onDragStateChange)(false);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value }, 
      { scale: isDragging.value ? 1.01 : 1 }
    ] as any,
    zIndex: isDragging.value ? 5 : 0,
    backgroundColor: isDragging.value ? colors.surfaceElevated : 'transparent',
    borderRadius: isDragging.value ? 10 : 0,
  }));

  return (
    <Animated.View
      onLayout={(e) => {
        rowHeight.value = e.nativeEvent.layout.height || 64;
      }}
      style={[animatedStyle]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {total > 1 && isReordering && (
          <GestureDetector gesture={gesture}>
            <View style={styles.itemDragHandle}>
              <Icon name={IconGripVertical} size={12} color={colors.subtext} />
            </View>
          </GestureDetector>
        )}
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    </Animated.View>
  );
}

const BudgetTab = React.forwardRef<any, BudgetTabProps>(
  (
    {
      categories,
      periodExpenses,
      categoryExpenses,
      categoryEarnings,
      allTimeCategoryExpenses,
      totalEarned,
      totalEarningsBudget,
      freeSpendExpenses,
      freeSpendBudget,
      isReorderMode,
      setIsReorderMode,
      setHasUnsavedChanges,
      onDragStateChange,
      month,
      year,
      onPrev,
      onNext,
      onDeleteCategory,
    },
    ref
  ) => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();

  const spentOf = (cat: any) => categoryExpenses[cat.id] || 0;
  const earnedOf = (cat: any) => categoryEarnings[cat.id] || 0;
  const budgetOf = (cat: any) => parseFloat(String(cat.budget || 0));
  const childrenOf = (cat: any) => (Array.isArray(cat.children) ? cat.children : []);

  const earningsParent = categories.find((c: any) => c.type === 'EARNING' && c.is_default);
  const earningChildrenRaw = earningsParent ? childrenOf(earningsParent) : [];
  const otherEarningCats = categories.filter((c: any) => c.type === 'EARNING' && !c.is_default && !c.parent);
  const budgetCategoriesRaw = categories.filter((c: any) => !c.is_default && c.type !== 'EARNING');

  // Sum up only ACTIVE items
  const totalExpensesBudget = budgetCategoriesRaw
    .filter((c: any) => c.type === 'EXPENSE' && c.is_active !== false)
    .reduce((sum: number, c: any) => {
      const children = childrenOf(c).filter((ch: any) => ch.is_active !== false);
      if (children.length > 0) {
        return sum + children.reduce((s: number, ch: any) => s + budgetOf(ch), 0);
      }
      return sum + budgetOf(c);
    }, 0);

  // Ordered groups state
  const [groupOrder, setGroupOrder] = useState<number[]>([]);
  const [childOrders, setChildOrders] = useState<Record<number, number[]>>({});

  useEffect(() => {
    const sorted = [...budgetCategoriesRaw].sort(
      (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0) || new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const ids = sorted.map((c: any) => c.id);
    setGroupOrder((prev) => {
      if (prev.length === ids.length && prev.every((id, idx) => id === ids[idx])) return prev;
      const prevSet = new Set(prev);
      const idsSet = new Set(ids);
      const sameSet = prev.length === ids.length && ids.every((id: number) => prevSet.has(id)) && prev.every((id: number) => idsSet.has(id));
      if (sameSet) return prev;
      return ids;
    });
  }, [categories]);

  useEffect(() => {
    const next: Record<number, number[]> = {};
    categories.forEach((c: any) => {
      if (Array.isArray(c.children) && c.children.length > 0) {
        const sorted = [...c.children].sort(
          (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0) || new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        next[c.id] = sorted.map((ch: any) => ch.id);
      }
    });
    setChildOrders((prev) => {
      const nextKeys = Object.keys(next).sort().join(',');
      const prevKeys = Object.keys(prev).sort().join(',');
      if (nextKeys !== prevKeys) {
        const merged: Record<number, number[]> = { ...next };
        for (const k of Object.keys(prev)) {
          const nk = Number(k);
          if (next[nk] && prev[nk]) {
            const a = prev[nk];
            const b = next[nk];
            const sameSet = a.length === b.length && a.every((id) => b.includes(id)) && b.every((id) => a.includes(id));
            if (sameSet) merged[nk] = a;
          }
        }
        return merged;
      }
      return prev;
    });
  }, [categories]);

  const orderedBudgetCategories = React.useMemo(() => {
    if (groupOrder.length === 0) return budgetCategoriesRaw;
    const map = new Map(budgetCategoriesRaw.map((c: any) => [c.id, c]));
    const ordered = groupOrder.map((id) => map.get(id)).filter(Boolean) as any[];
    const missing = budgetCategoriesRaw.filter((c: any) => !groupOrder.includes(c.id));
    return [...ordered, ...missing];
  }, [budgetCategoriesRaw, groupOrder]);

  const getOrderedChildren = useCallback(
    (cat: any) => {
      const raw = childrenOf(cat);
      const order = childOrders[cat.id];
      if (!order || order.length === 0) return raw;
      const map = new Map(raw.map((ch: any) => [ch.id, ch]));
      const ordered = order.map((id: number) => map.get(id)).filter(Boolean) as any[];
      const missing = raw.filter((ch: any) => !order.includes(ch.id));
      return [...ordered, ...missing];
    },
    [childOrders]
  );

  const orderedEarningChildren = React.useMemo(() => {
    if (!earningsParent) return [];
    return getOrderedChildren(earningsParent);
  }, [earningsParent, getOrderedChildren]);

  const handleGroupMove = useCallback(
    (from: number, to: number) => {
      const newOrder = [...groupOrder];
      const [moved] = newOrder.splice(from, 1);
      newOrder.splice(to, 0, moved);
      setGroupOrder(newOrder);
      setHasUnsavedChanges(true);
    },
    [groupOrder, setHasUnsavedChanges]
  );

  const handleChildMove = useCallback(
    (parentId: number, from: number, to: number) => {
      const order = childOrders[parentId] || [];
      const newOrder = [...order];
      const [moved] = newOrder.splice(from, 1);
      newOrder.splice(to, 0, moved);
      setChildOrders((m) => ({ ...m, [parentId]: newOrder }));
      setHasUnsavedChanges(true);
    },
    [childOrders, setHasUnsavedChanges]
  );

  React.useImperativeHandle(ref, () => ({
    saveReorder: async () => {
      try {
        if (groupOrder.length > 0) {
          await reorderCategories(groupOrder, null);
        }
        for (const parentId of Object.keys(childOrders)) {
          const pid = Number(parentId);
          if (childOrders[pid]) {
            await reorderCategories(childOrders[pid], pid);
          }
        }
      } catch (e) {
        console.error('Failed to save reorder', e);
      }
    },
  }));

  const renderCategorySection = (cat: any, index: number) => {
    const allChildren = getOrderedChildren(cat);
    // Filter out fully paid debt items from previous months
    const children = allChildren.filter((item: any) => {
      if (item.is_debt !== true) return true;
      const total = (item.budget || 0) * (item.debt_months || 1);
      const paid = allTimeCategoryExpenses[item.id] || 0;
      if (paid < total) return true;
      // Fully paid — keep only if there's spending this month
      const thisMonthSpent = spentOf(item);
      return thisMonthSpent > 0;
    });
    const activeChildren = children.filter((ch: any) => ch.is_active !== false);
    const parentSpent = activeChildren.reduce((s: number, ch: any) => s + spentOf(ch), 0);
    const parentBudget = activeChildren.reduce((s: number, ch: any) => s + budgetOf(ch), 0);
    const parentPct = parentBudget > 0 ? Math.max(0, Math.min(parentSpent / parentBudget, 1)) : 0;
    const parentOver = parentBudget > 0 && parentSpent > parentBudget;
    const sectionColor = cat.color || colors.border;
    const isSectionDisabled = cat.is_active === false;

    return (
      <View style={[styles.section, isSectionDisabled && { opacity: 0.5 }]}>
        <View style={styles.sectionHeader}>
          <TouchableOpacity
            style={styles.sectionHeaderLeft}
            onPress={() => navigation.navigate('CategoryEntry', { category: cat })}
            activeOpacity={0.7}
          >
            <View style={[styles.itemDot, { backgroundColor: isSectionDisabled ? colors.subtext : sectionColor }]} />
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AppText bold style={[styles.sectionName, { color: colors.text }]}>{cat.name}</AppText>
                {isSectionDisabled && <Icon name={IconEyeOff} size={12} color={colors.subtext} />}
              </View>
              <AppText style={[styles.sectionMeta, { color: colors.subtext }]}>
                {children.length} {children.length === 1 ? 'item' : 'items'}
              </AppText>
            </View>
          </TouchableOpacity>
          <View style={styles.sectionHeaderRight}>
            {!isSectionDisabled && parentBudget > 0 && (
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

        {!isSectionDisabled && parentBudget > 0 && (
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

        {children.length > 0 ? (
          <View style={styles.itemsList}>
            {children.map((item: any, i: number) => {
              const isItemDisabled = item.is_active === false || isSectionDisabled;
              const itemSpent = spentOf(item);
              const itemBudget = budgetOf(item);
              const itemPct = itemBudget > 0 ? Math.max(0, Math.min(itemSpent / itemBudget, 1)) : 0;
              const itemOver = itemBudget > 0 && itemSpent > itemBudget;
              const itemColor = isItemDisabled ? colors.subtext : (item.color || sectionColor);
              const itemIcon = item.icon ? resolveIcon(item.icon) : IconWallet;

              const isDebtItem = item.is_debt === true;
              const debtTotal = isDebtItem ? itemBudget * (item.debt_months || 1) : 0;
              const debtPaid = isDebtItem ? (allTimeCategoryExpenses[item.id] || 0) : 0;
              const debtPct = debtTotal > 0 ? Math.max(0, Math.min(debtPaid / debtTotal, 1)) : 0;
              const debtRemaining = Math.max(0, debtTotal - debtPaid);
              const debtMonthsPaid = isDebtItem && itemBudget > 0 ? Math.floor(debtPaid / itemBudget) : 0;
              const debtMonthsTotal = isDebtItem ? (item.debt_months || 1) : 0;

              const row = (
                <TouchableOpacity
                  style={[
                    styles.itemRow,
                    i < children.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border + '30' },
                    isItemDisabled && { opacity: 0.6 }
                  ]}
                  onPress={() => navigation.navigate('CategoryItemEntry', { item })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.sectionIcon, { backgroundColor: `${isDebtItem ? itemColor : itemColor}1A` }]}>
                    <Icon name={itemIcon} size={16} color={isDebtItem ? itemColor : itemColor} />
                  </View>
                  <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <AppText style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                          {item.name}
                        </AppText>
                        {item.is_active === false && <Icon name={IconEyeOff} size={10} color={colors.subtext} />}
                        {isDebtItem && <AppText style={{ color: itemColor, fontSize: 9, fontWeight: '700', backgroundColor: `${itemColor}18`, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, overflow: 'hidden' }}>DEBT</AppText>}
                      </View>
                      {!isItemDisabled && itemBudget > 0 && (
                        <AppText style={[styles.itemAmount, { color: colors.subtext }]}>
                          {isDebtItem
                            ? `${formatCompact(itemSpent)} / ${formatCompact(itemBudget)}`
                            : `${formatCompact(itemSpent)} / ${formatCompact(itemBudget)}`
                          }
                        </AppText>
                      )}
                    </View>
                    {/* Monthly payment progress bar */}
                    {!isItemDisabled && itemBudget > 0 && (
                      <View style={[styles.progressTrack, { backgroundColor: colors.surfaceElevated }]}>
                        <LinearGradient
                          colors={itemOver ? [colors.error, colors.error + 'CC'] : [itemColor, itemColor + '99']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.progressFill, { width: `${itemPct * 100}%` }]}
                        />
                        {(() => {
                          const splitCount = Array.isArray(item.due_dates) ? item.due_dates.length : 0;
                          if (splitCount <= 1) return null;
                          return Array.from({ length: splitCount - 1 }, (_, i) => {
                            const pct = ((i + 1) / splitCount) * 100;
                            return (
                              <View
                                key={i}
                                style={[styles.splitDivider, { left: `${pct}%` }]}
                              />
                            );
                          });
                        })()}
                      </View>
                    )}
                    {/* Total debt progress bar */}
                    {isDebtItem && !isItemDisabled && debtTotal > 0 && (
                      <>
                        <View style={styles.debtHeader}>
                          <AppText style={[styles.debtCounter, { color: itemColor }]}>
                            {Math.min(debtMonthsPaid, debtMonthsTotal)}/{debtMonthsTotal} payments
                          </AppText>
                          <AppText style={[styles.debtRemaining, { color: colors.subtext }]}>
                            {formatCompact(debtRemaining)} remaining
                          </AppText>
                        </View>
                        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceElevated }]}>
                          <LinearGradient
                            colors={[itemColor + 'AA', itemColor + '55']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.progressFill, { width: `${debtPct * 100}%` }]}
                          />
                        </View>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              );

              const wrapped = (
                <DraggableItem parentId={cat.id} index={i} total={children.length} onMove={handleChildMove} isReordering={isReorderMode} onDragStateChange={onDragStateChange}>
                  {row}
                </DraggableItem>
              );

              return (
                <SwipeDelete key={item.id} onDelete={() => onDeleteCategory(item)}>
                  {children.length > 1 ? wrapped : row}
                </SwipeDelete>
              );
            })}
          </View>
        ) : (
          <AppText style={[styles.emptyItems, { color: colors.subtext }]}>No items yet</AppText>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <PeriodSelector month={month} year={year} onPrev={onPrev} onNext={onNext} />

      <SectionCard title="BUDGET">
        <View style={styles.totalRow}>
          <AppText style={[styles.totalLabel, { color: colors.subtext }]}>Total Earnings</AppText>
          <AppText bold style={[styles.totalValue, { color: colors.text }]}>
            {formatMoney(totalEarningsBudget)}
          </AppText>
        </View>
        <View style={styles.totalRow}>
          <AppText style={[styles.totalLabel, { color: colors.subtext }]}>Total Expenses</AppText>
          <AppText style={[styles.totalValue, { color: colors.text }]}>
            {formatMoney(totalExpensesBudget)}
          </AppText>
        </View>
        <View style={styles.totalRow}>
          <AppText style={[styles.totalLabel, { color: colors.subtext }]}>Total Spent</AppText>
          <AppText style={[styles.totalValue, { color: colors.text }]}>
            {formatMoney(periodExpenses)}
          </AppText>
        </View>
        <BudgetFillChart spent={periodExpenses} totalBudget={totalExpensesBudget} income={totalEarned} />
      </SectionCard>

      {freeSpendBudget > 0 && (
        <SectionCard title="FREE SPENDING">
          <View style={styles.totalRow}>
            <AppText style={[styles.totalLabel, { color: colors.subtext }]}>Allowed</AppText>
            <TouchableOpacity onPress={() => navigation.navigate('CategoryEntry', { isFreeSpend: true })}>
              <AppText bold style={[styles.totalValue, { color: colors.text }]}>
                {formatMoney(freeSpendBudget)}
              </AppText>
            </TouchableOpacity>
          </View>
          <View style={styles.totalRow}>
            <AppText style={[styles.totalLabel, { color: colors.subtext }]}>Spent</AppText>
            <AppText style={[styles.totalValue, { color: colors.text }]}>
              {formatMoney(freeSpendExpenses)}
            </AppText>
          </View>
          <BudgetFillChart spent={freeSpendExpenses} totalBudget={freeSpendBudget} />
        </SectionCard>
      )}

      <View style={styles.groupDivider}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <View style={styles.groupLabelRow}>
          <AppText style={[styles.groupLabel, { color: colors.subtext }]}>INCOME</AppText>
        </View>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      <SectionCard>
        {(() => {
          const earningsColor = '#34C759';
          return (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TouchableOpacity
                  style={styles.sectionHeaderLeft}
                  onPress={() => earningsParent && navigation.navigate('CategoryEntry', { category: earningsParent })}
                  activeOpacity={earningsParent ? 0.7 : 1}
                >
                  <View style={[styles.itemDot, { backgroundColor: earningsColor }]} />
                  <View>
                    <AppText bold style={[styles.sectionName, { color: colors.text }]}>
                      {earningsParent?.name || 'Earnings'}
                    </AppText>
                    <AppText style={[styles.sectionMeta, { color: colors.subtext }]}>
                      {orderedEarningChildren.length} {orderedEarningChildren.length === 1 ? 'item' : 'items'}
                    </AppText>
                  </View>
                </TouchableOpacity>
                <View style={styles.sectionHeaderRight}>
                  {totalEarningsBudget > 0 && (
                    <View style={styles.sectionAmounts}>
                      <AppText style={[styles.sectionPaid, { color: earningsColor }]}>
                        {formatCompact(totalEarned)}
                      </AppText>
                      <AppText style={[styles.sectionTotal, { color: colors.subtext }]}>
                        / {formatCompact(totalEarningsBudget)}
                      </AppText>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.sectionAdd}
                    onPress={() => {
                      if (earningsParent) {
                        navigation.navigate('CategoryItemEntry', {
                          parent: { id: earningsParent.id, name: earningsParent.name, type: earningsParent.type },
                        });
                      } else {
                        navigation.navigate('CategoryEntry', { type: 'EARNING' });
                      }
                    }}
                    hitSlop={6}
                    activeOpacity={0.7}
                  >
                    <Icon name={IconPlus} size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              {totalEarningsBudget > 0 && (
                <View style={styles.sectionProgress}>
                  <View style={styles.sectionProgressHeader}>
                    <AppText style={[styles.sectionProgressLabel, { color: colors.subtext }]}>
                      {formatCompact(totalEarned)} / {formatCompact(totalEarningsBudget)}
                    </AppText>
                    <AppText style={[styles.sectionProgressPct, { color: earningsColor }]}>
                      {Math.round((totalEarned / totalEarningsBudget) * 100)}%
                    </AppText>
                  </View>
                  <View style={[styles.progressTrack, { backgroundColor: colors.surfaceElevated }]}>
                    <LinearGradient
                      colors={[earningsColor, earningsColor + 'CC']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${Math.min((totalEarned / totalEarningsBudget) * 100, 100)}%` }]}
                    />
                  </View>
                </View>
              )}

              {orderedEarningChildren.length > 0 ? (
                <View style={styles.itemsList}>
                  {orderedEarningChildren.map((item: any, i: number) => {
                    const isItemDisabled = item.is_active === false;
                    const itemEarned = earnedOf(item);
                    const itemBudget = budgetOf(item);
                    const itemPct = itemBudget > 0 ? Math.max(0, Math.min(itemEarned / itemBudget, 1)) : 0;
                    const itemColor = isItemDisabled ? colors.subtext : (item.color || earningsColor);
                    const itemIcon = item.icon ? resolveIcon(item.icon) : IconWallet;
                    const isDefaultItem = item.name === 'Salary';
                    const row = (
                      <TouchableOpacity
                        style={[
                          styles.itemRow,
                          i < orderedEarningChildren.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border + '30' },
                          isItemDisabled && { opacity: 0.6 }
                        ]}
                        onPress={() => navigation.navigate('CategoryItemEntry', { item })}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.sectionIcon, { backgroundColor: `${itemColor}1A` }]}>
                          <Icon name={itemIcon} size={16} color={itemColor} />
                        </View>
                        <View style={styles.itemContent}>
                          <View style={styles.itemHeader}>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <AppText style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                                {item.name}
                              </AppText>
                              {item.is_active === false && <Icon name={IconEyeOff} size={10} color={colors.subtext} />}
                            </View>
                            {!isItemDisabled && itemBudget > 0 ? (
                              <AppText style={[styles.itemAmount, { color: colors.subtext }]}>
                                {formatCompact(itemEarned)} / {formatCompact(itemBudget)}
                              </AppText>
                            ) : (
                              <AppText style={[styles.itemAmount, { color: colors.subtext }]}>-</AppText>
                            )}
                          </View>
                          {!isItemDisabled && itemBudget > 0 && (
                            <View style={[styles.progressTrack, { backgroundColor: colors.surfaceElevated }]}>
                              <LinearGradient
                                colors={[itemColor, itemColor + '99']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.progressFill, { width: `${itemPct * 100}%` }]}
                              />
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                    if (isDefaultItem) return <View key={item.id}>{row}</View>;
                    const wrappedRow = orderedEarningChildren.length > 1 ? (
                      <DraggableItem parentId={earningsParent.id} index={i} total={orderedEarningChildren.length} onMove={handleChildMove} isReordering={isReorderMode} onDragStateChange={onDragStateChange}>
                        {row}
                      </DraggableItem>
                    ) : row;
                    return (
                      <SwipeDelete key={item.id} onDelete={() => onDeleteCategory(item)}>{wrappedRow}</SwipeDelete>
                    );
                  })}
                </View>
              ) : (
                <AppText style={[styles.emptyItems, { color: colors.subtext }]}>No items yet</AppText>
              )}
            </View>
          );
        })()}
      </SectionCard>

      <View style={styles.groupDivider}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <View style={styles.groupLabelRow}>
          <AppText style={[styles.groupLabel, { color: colors.subtext }]}>EXPENSE</AppText>
        </View>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      {orderedBudgetCategories.map((cat, i) => (
        <DraggableGroup
          key={cat.id}
          cat={cat}
          index={i}
          total={orderedBudgetCategories.length}
          onMove={handleGroupMove}
          isReordering={isReorderMode}
          onDragStateChange={onDragStateChange}
        >
          <SectionCard>{renderCategorySection(cat, i)}</SectionCard>
        </DraggableGroup>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: 16 },
  groupDivider: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4, marginTop: 4 },
  dividerLine: { flex: 1, height: 1, opacity: 0.6 },
  groupLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  groupLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingVertical: 6 },
  totalLabel: { fontSize: 12, fontWeight: '700' },
  totalValue: { fontSize: 12 },
  section: { marginBottom: 0 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  sectionIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionName: { fontSize: 14, letterSpacing: 0.3 },
  sectionMeta: { fontSize: 11, marginTop: 1 },
  sectionHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionAmounts: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  sectionPaid: { fontSize: 12, fontWeight: '700' },
  sectionTotal: { fontSize: 11, fontWeight: '500' },
  sectionAdd: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(128,128,128,0.3)', justifyContent: 'center', alignItems: 'center' },
  sectionProgress: { marginBottom: 10 },
  sectionProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sectionProgressLabel: { fontSize: 11, fontWeight: '600' },
  sectionProgressPct: { fontSize: 11, fontWeight: '700' },
  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  splitDivider: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.5)' },
  debtRemaining: { fontSize: 10, marginTop: 2, textAlign: 'right' },
  debtHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: 2 },
  debtCounter: { fontSize: 10, fontWeight: '700' },
  itemsList: { gap: 0 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  itemDot: { width: 8, height: 8, borderRadius: 4 },
  itemContent: { flex: 1, gap: 6 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemName: { fontSize: 14, fontWeight: '500', flex: 1 },
  itemAmount: { fontSize: 11, fontWeight: '600' },
  emptyItems: { fontSize: 12, paddingVertical: 12, textAlign: 'center' },
  groupDragHandle: { width: 28, height: 48, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 8, alignSelf: 'center' },
  itemDragHandle: { width: 24, height: 32, justifyContent: 'center', alignItems: 'center', marginRight: 2 },
});

export default BudgetTab;
