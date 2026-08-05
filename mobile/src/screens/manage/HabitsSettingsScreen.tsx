import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { IconPlus, IconTarget, IconFlame } from 'tabler-icons-react-native';
import ScreenLayout from '../../components/common/ScreenLayout';
import { ActionButton } from '../../components/common/ActionButton';
import { getAllHabits, updateHabit, deleteHabit } from '../../api/habits';
import DeleteConfirm from '../../components/ui/DeleteConfirm';
import { SwipeableRow } from '../../components/ui/SwipeableRow';
import { HabitManagementItem } from '../../components/habits/HabitManagementItem';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { useTheme } from '../../context/ThemeContext';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';

const toDateStr = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getStreak = (history: { date: string; completed: boolean }[], daysOfWeek: number[]) => {
  const completedDates = new Set(history.filter(h => h.completed).map(h => h.date));
  const now = new Date();
  let streak = 0;

  const todayIdx = (now.getDay() + 6) % 7;
  if (daysOfWeek.includes(todayIdx) && completedDates.has(toDateStr(now))) {
    streak = 1;
  }

  const checkDate = new Date(now);
  checkDate.setDate(checkDate.getDate() - 1);
  while (true) {
    const dateStr = toDateStr(checkDate);
    const dayIdx = (checkDate.getDay() + 6) % 7;
    if (daysOfWeek.includes(dayIdx)) {
      if (completedDates.has(dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    checkDate.setDate(checkDate.getDate() - 1);
    if (streak > 365) break;
  }
  return streak;
};

const isActive = (h: any) => h.is_active !== false;

const SkeletonCard = () => {
  const { colors } = useTheme();
  const glow = useSharedValue(0.5);

  useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
    return () => cancelAnimation(glow);
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <View style={[styles.skeletonCard, { backgroundColor: colors.surface }]}>
      <Animated.View style={[styles.skeletonBlock, style, { backgroundColor: colors.surfaceElevated }]} />
      <View style={styles.skeletonLines}>
        <Animated.View style={[styles.skeletonLine, style, { backgroundColor: colors.surfaceElevated }]} />
        <Animated.View style={[styles.skeletonLineShort, style, { backgroundColor: colors.surfaceElevated }]} />
      </View>
    </View>
  );
};

export default function HabitsSettingsScreen() {
  const { colors, entityColors } = useTheme();
  const habitColor = entityColors.habits;
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const activeHabits = habits.filter(isActive);
  const pausedHabits = habits.filter(h => !isActive(h));
  const bestStreak = activeHabits.reduce(
    (max, h) => Math.max(max, getStreak(h.history || [], h.days_of_week || [])),
    0
  );

  const fetchHabits = async () => {
    try {
      const data = await getAllHabits();
      setHabits(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) fetchHabits();
  }, [isFocused]);

  const toggleActive = async (habit: any) => {
    const next = !isActive(habit);
    setHabits(habits.map(h => h.id === habit.id ? { ...h, is_active: next } : h));
    try {
      await updateHabit(habit.id, { is_active: next });
      fetchHabits();
    } catch {
      fetchHabits();
    }
  };

  const confirmDelete = (habit: any) => setDeleteTarget(habit);

  const executeDelete = async () => {
    if (!deleteTarget) return;
    await deleteHabit(deleteTarget.id);
    setDeleteTarget(null);
    fetchHabits();
  };

  const renderItem = (habit: any, index: number) => (
    <Animated.View key={habit.id} entering={FadeInDown.duration(280).delay(index * 55)}>
      <SwipeableRow isActive={isActive(habit)} onToggleActive={() => toggleActive(habit)}>
        <HabitManagementItem
          name={habit.name}
          iconName={habit.icon}
          daysOfWeek={habit.days_of_week || []}
          history={habit.history || []}
          isActive={isActive(habit)}
          onPress={() => navigation.navigate('HabitEntry', { habit })}
          onLongPress={() => confirmDelete(habit)}
        />
      </SwipeableRow>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Animated.View entering={FadeIn.delay(80)}>
        <View style={[styles.emptyIcon, { backgroundColor: habitColor + '1A' }]}>
          <Icon name={IconTarget} size={36} color={habitColor} />
        </View>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(160)} style={styles.emptyText}>
        <AppText style={[styles.emptyTitle, { color: colors.text }]}>No Habits Yet</AppText>
        <AppText style={[styles.emptyDesc, { color: colors.subtext }]}>
          Start building better routines. Create your first habit and build an unbroken streak.
        </AppText>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(240)}>
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: habitColor }]}
          onPress={() => navigation.navigate('HabitEntry')}
          activeOpacity={0.85}
        >
          <Icon name={IconPlus} size={18} color="#FFFFFF" />
          <AppText style={styles.createBtnText}>Create Habit</AppText>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  return (
    <ScreenLayout
      title="MANAGE HABITS"
      showBack={true}
      contentStyle={{ paddingHorizontal: 0 }}
      rightOption={{
        icon: () => <ActionButton icon={IconPlus} onPress={() => navigation.navigate('HabitEntry')} size={40} />,
      }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.skeletonList}>
            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          </View>
        ) : habits.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
          <View style={styles.statsRow}>
            <AppText style={[styles.statText, { color: colors.subtext }]}>
              {activeHabits.length} Active
            </AppText>
            <AppText style={[styles.statDot, { color: colors.subtext }]}>·</AppText>
            <View style={styles.streakStat}>
              <Icon name={IconFlame} size={13} color="#FF9500" />
              <AppText style={[styles.statText, { color: colors.subtext }]}>{bestStreak} day streak</AppText>
            </View>
          </View>

          {activeHabits.length > 0 && (
              <View style={styles.sectionGroup}>
                <AppText style={[styles.sectionTitle, { color: colors.subtext }]}>ACTIVE</AppText>
                <View style={styles.listGroup}>
                  {activeHabits.map((h, i) => renderItem(h, i))}
                </View>
              </View>
            )}

            {pausedHabits.length > 0 && (
              <View style={styles.sectionGroup}>
                <AppText style={[styles.sectionTitle, { color: colors.subtext }]}>PAUSED</AppText>
                <View style={styles.listGroup}>
                  {pausedHabits.map((h, i) => renderItem(h, i))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <DeleteConfirm
        visible={!!deleteTarget}
        title="Delete Habit"
        message={`Delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingBottom: 40,
    gap: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 8,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  statDot: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.5,
  },
  streakStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionGroup: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    paddingHorizontal: 4,
  },
  listGroup: {
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 30,
    gap: 14,
  },
  emptyText: {
    alignItems: 'center',
    gap: 8,
  },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 12,
    marginTop: 8,
  },
  createBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  skeletonList: {
    gap: 12,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  skeletonBlock: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  skeletonLines: {
    flex: 1,
    gap: 8,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    width: '70%',
  },
  skeletonLineShort: {
    height: 12,
    borderRadius: 6,
    width: '45%',
  },
});