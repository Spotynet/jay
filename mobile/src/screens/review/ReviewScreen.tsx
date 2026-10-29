import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import ScreenLayout from '../../components/common/ScreenLayout';
import SectionCard from '../../components/common/SectionCard';
import { AppText } from '../../components/ui/AppText';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Icon } from '../../components/ui/Icon';
import { ENTITY_ICONS } from '../../constants/entityIcons';
import { getHabitsForDate } from '../../api/habits';
import { getTasksForDate } from '../../api/tasks';
import { getEventsForDate } from '../../api/events';
import { getJournalEntries } from '../../api/journal';
import { getTransactions } from '../../api/finance';
import { toLocalDateString, parseLocalDate } from '../../utils/date';
import {
  buildTaskHabitMetrics,
  buildEventCountMetric,
  clampProgress,
  formatRemainingStatus,
} from '../../utils/dayMetrics';
import { IconChevronRight } from 'tabler-icons-react-native';

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  return d;
}

function weekDateKeys(anchor: Date): string[] {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return toLocalDateString(d);
  });
}

type StatRowProps = {
  label: string;
  value: string;
  detail?: string;
  color: string;
  icon: any;
  onPress?: () => void;
};

function StatRow({ label, value, detail, color, icon, onPress }: StatRowProps) {
  const { colors } = useTheme();
  const body = (
    <View style={styles.statRow}>
      <View style={[styles.statIcon, { backgroundColor: color + '22' }]}>
        <Icon name={icon} size={16} color={color} stroke={1.8} />
      </View>
      <View style={styles.statCopy}>
        <AppText style={[styles.statLabel, { color: colors.subtext }]}>{label}</AppText>
        {detail ? (
          <AppText style={[styles.statDetail, { color: colors.subtext }]}>{detail}</AppText>
        ) : null}
      </View>
      <AppText bold style={[styles.statValue, { color: colors.text }]}>
        {value}
      </AppText>
      {onPress ? (
        <Icon name={IconChevronRight} size={16} color={colors.subtext} stroke={1.6} />
      ) : null}
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}, ${value}`}>
      {body}
    </Pressable>
  );
}

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  const { colors, isDark } = useTheme();
  const track = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  return (
    <View style={[styles.progressTrack, { backgroundColor: track }]}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${Math.round(clampProgress(progress, 1) * 100)}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

export default function ReviewScreen() {
  const { colors, entityColors, accentColor } = useTheme();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [tasks, setTasks] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);
  const todayStr = toLocalDateString(today);
  const weekKeys = useMemo(() => weekDateKeys(today), [today]);

  const fetchData = useCallback(async () => {
    try {
      const [taskData, habitData, eventData, journalData, txData] = await Promise.all([
        getTasksForDate(todayStr),
        getHabitsForDate(todayStr),
        getEventsForDate(todayStr),
        getJournalEntries().catch(() => []),
        getTransactions().catch(() => []),
      ]);
      setTasks(Array.isArray(taskData) ? taskData : []);
      setHabits(Array.isArray(habitData) ? habitData : []);
      setEvents(Array.isArray(eventData) ? eventData : []);
      setJournalEntries(Array.isArray(journalData) ? journalData : []);
      setTransactions(Array.isArray(txData) ? txData : []);
      setError(null);
    } catch (e) {
      console.error('Review fetch failed', e);
      setError("Couldn't load your review.");
    }
  }, [todayStr]);

  useEffect(() => {
    if (isFocused) fetchData();
  }, [isFocused, fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const todayMetrics = useMemo(() => {
    const [taskMetric, habitMetric] = buildTaskHabitMetrics({
      tasks,
      habits,
      entityColors: { tasks: entityColors.tasks, habits: entityColors.habits },
    });
    const eventMetric = buildEventCountMetric(events, entityColors.events);
    return { taskMetric, habitMetric, eventMetric };
  }, [tasks, habits, events, entityColors]);

  const todayCompletion = useMemo(() => {
    const completable =
      todayMetrics.taskMetric.total + todayMetrics.habitMetric.total;
    const done = todayMetrics.taskMetric.value + todayMetrics.habitMetric.value;
    return { done, total: completable, pct: completable > 0 ? Math.round((done / completable) * 100) : 0 };
  }, [todayMetrics]);

  const weekJournal = useMemo(() => {
    const dates = new Set(
      journalEntries
        .map((e) => String(e.date || '').slice(0, 10))
        .filter(Boolean),
    );
    const filled = weekKeys.filter((k) => dates.has(k)).length;
    const moods = journalEntries
      .filter((e) => weekKeys.includes(String(e.date || '').slice(0, 10)))
      .map((e) => e.mood_score)
      .filter((n): n is number => typeof n === 'number' && n > 0);
    const avgMood =
      moods.length > 0
        ? Math.round((moods.reduce((s, n) => s + n, 0) / moods.length) * 10) / 10
        : null;
    return { filled, total: weekKeys.length, avgMood };
  }, [journalEntries, weekKeys]);

  const monthFinance = useMemo(() => {
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const monthTx = transactions.filter((t) => {
      const [ty, tm] = String(t.date || '').split('-').map(Number);
      return ty === y && tm === m;
    });
    const income = monthTx
      .filter((t) => t.type === 'EARNING')
      .reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const spent = monthTx
      .filter((t) => t.type === 'EXPENSE')
      .reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    return { income, spent, free: income - spent };
  }, [transactions, today]);

  const goToday = () => navigation.navigate('Today');
  const goJournal = () => navigation.navigate('Journal');
  const goFinance = () => navigation.navigate('Financial');

  return (
    <ScreenLayout title="Review">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentColor} />
        }
      >
        <ErrorMessage message={error} />

        <SectionCard title="TODAY">
          <View style={styles.hero}>
            <AppText bold style={[styles.heroPct, { color: colors.text }]}>
              {todayCompletion.total > 0 ? `${todayCompletion.pct}%` : '—'}
            </AppText>
            <AppText style={[styles.heroSub, { color: colors.subtext }]}>
              {todayCompletion.total > 0
                ? `${todayCompletion.done} of ${todayCompletion.total} tasks & habits done`
                : 'Nothing scheduled to complete today'}
            </AppText>
            {todayCompletion.total > 0 ? (
              <ProgressBar
                progress={todayCompletion.pct / 100}
                color={todayCompletion.pct === 100 ? '#34C759' : accentColor}
              />
            ) : null}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <StatRow
            label="Tasks"
            value={`${todayMetrics.taskMetric.value}/${todayMetrics.taskMetric.total}`}
            detail={formatRemainingStatus(
              todayMetrics.taskMetric.value,
              todayMetrics.taskMetric.total,
            )}
            color={entityColors.tasks}
            icon={ENTITY_ICONS.task}
            onPress={goToday}
          />
          <StatRow
            label="Habits"
            value={`${todayMetrics.habitMetric.value}/${todayMetrics.habitMetric.total}`}
            detail={formatRemainingStatus(
              todayMetrics.habitMetric.value,
              todayMetrics.habitMetric.total,
            )}
            color={entityColors.habits}
            icon={ENTITY_ICONS.habit}
            onPress={goToday}
          />
          <StatRow
            label="Events"
            value={String(todayMetrics.eventMetric.value)}
            detail={
              todayMetrics.eventMetric.value === 0
                ? 'None today'
                : todayMetrics.eventMetric.value === 1
                  ? '1 on the timeline'
                  : `${todayMetrics.eventMetric.value} on the timeline`
            }
            color={entityColors.events}
            icon={ENTITY_ICONS.event}
            onPress={goToday}
          />
        </SectionCard>

        <SectionCard title="THIS WEEK">
          <StatRow
            label="Journal days"
            value={`${weekJournal.filled}/${weekJournal.total}`}
            detail={
              weekJournal.filled === weekJournal.total
                ? 'Every day logged'
                : `${weekJournal.total - weekJournal.filled} day${
                    weekJournal.total - weekJournal.filled === 1 ? '' : 's'
                  } still open`
            }
            color={entityColors.journal}
            icon={ENTITY_ICONS.journal}
            onPress={goJournal}
          />
          <ProgressBar
            progress={weekJournal.filled / weekJournal.total}
            color={entityColors.journal}
          />
          {weekJournal.avgMood != null ? (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <StatRow
                label="Avg mood"
                value={`${weekJournal.avgMood}`}
                detail="From journal check-ins this week"
                color={entityColors.journal}
                icon={ENTITY_ICONS.journal}
                onPress={goJournal}
              />
            </>
          ) : null}
        </SectionCard>

        <SectionCard title="THIS MONTH">
          <StatRow
            label="Spent"
            value={formatMoney(monthFinance.spent)}
            color={entityColors.finance}
            icon={ENTITY_ICONS.finance}
            onPress={goFinance}
          />
          <StatRow
            label="Income"
            value={formatMoney(monthFinance.income)}
            color={entityColors.finance}
            icon={ENTITY_ICONS.finance}
            onPress={goFinance}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <StatRow
            label={monthFinance.income > 0 ? 'Free to spend' : 'Net'}
            value={formatMoney(monthFinance.free)}
            detail={
              monthFinance.income > 0
                ? 'Income minus expenses'
                : 'Expenses with no income logged'
            }
            color={entityColors.finance}
            icon={ENTITY_ICONS.finance}
            onPress={goFinance}
          />
        </SectionCard>

        <AppText style={[styles.footnote, { color: colors.subtext }]}>
          Pull to refresh · {parseLocalDate(todayStr).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </AppText>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingBottom: 28,
    gap: 18,
  },
  hero: {
    gap: 8,
    paddingBottom: 4,
  },
  heroPct: {
    fontSize: 36,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    minHeight: 44,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statDetail: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 15,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  footnote: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
});
