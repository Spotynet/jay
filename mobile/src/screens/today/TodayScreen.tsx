import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';
import { IconPlus, IconUser } from 'tabler-icons-react-native';
import ScreenLayout from '../../components/common/ScreenLayout';
import { getJournalEntries, getJournalSettings } from '../../api/journal';
import { getHabitsForDate, toggleHabitCompletion } from '../../api/habits';
import { getTasksForDate, toggleTaskCompletion } from '../../api/tasks';
import { getProjects } from '../../api/projects';
import { getEventsForDate } from '../../api/events';
import { getCategories, getTransactions } from '../../api/finance';
import { ActionButton } from '../../components/common/ActionButton';
import CalendarPickerModal from '../../components/common/CalendarPickerModal';
import { TimelineAgenda } from '../../components/timeline/TimelineAgenda';
import { CreateNewModal } from './components/CreateNewModal';
import { DayMetricStrip } from '../../components/timeline/DayMetricStrip';
import {
  buildDueCountMetric,
  buildEventCountMetric,
  buildTaskHabitMetrics,
} from '../../utils/dayMetrics';
import { FINANCE_ICONS } from '../../constants/financeIcons';
import { HABIT_ICONS } from '../../constants/habitIcons';
import { ENTITY_ICONS } from '../../constants/entityIcons';
import { getJournalTimelineState, JournalSettings } from '../../utils/journalScheduling';
import { isJournalDayReviewComplete } from '../../utils/journalReviewCompletion';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { toLocalDateString, parseLocalDate } from '../../utils/date';
import { AgendaItem } from '../../utils/timelineLayout';
import { parseDurationToMinutes } from '../../utils/timelineInterval';
import { resolveAgendaEditorTarget } from '../../utils/agendaNavigation';
import { handleJournalAgendaPress } from '../../utils/agendaJournalPress';

function resolveHabitIcon(iconName?: string | null) {
  if (!iconName) return ENTITY_ICONS.habit;
  return HABIT_ICONS.find((i) => i.name === iconName)?.icon || ENTITY_ICONS.habit;
}

function durationMinutesFromField(value: string | null | undefined): number | undefined {
  return parseDurationToMinutes(value);
}

export default function TodayScreen() {
  const { entityColors } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [journalSettings, setJournalSettings] = useState<JournalSettings | null>(null);
  const [habits, setHabits] = useState<any[]>([]);
  /** False while habits for selectedDate are loading or failed — avoids false Journal completion. */
  const [habitsReady, setHabitsReady] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pendingHour, setPendingHour] = useState<{ hour: number; minute: number } | null>(null);
  const completionLockRef = useRef(new Set<string>());
  /** Drop stale timeline fetches after date/focus races. */
  const fetchGenRef = useRef(0);
  /** Local date string of the last successful habits load — avoid false incomplete on refetch. */
  const habitsLoadedForDateRef = useRef<string | null>(null);
  const selectedDateRef = useRef(selectedDate);
  selectedDateRef.current = selectedDate;

  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const checkExactMatch = (reminder: any, date: Date) => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const jsDay = date.getDay(); 
    const backendDay = jsDay === 0 ? 6 : jsDay - 1; // 0=Mon, 6=Sun
    const dom = Number(reminder.day_of_month);
    const dow = Number(reminder.day_of_week);
    const wom = reminder.week_of_month != null ? Number(reminder.week_of_month) : null;

    if (reminder.frequency === 'WEEKLY') {
      return dow === backendDay;
    } else if (reminder.frequency === 'MONTHLY') {
      if (dom > 0 && wom == null) {
        return dom === day;
      }
      if (dom === -1) {
        const lastDay = new Date(year, month + 1, 0).getDate();
        return day === lastDay;
      }
      if (wom != null && dow !== null) {
        if (dow !== backendDay) return false;
        if (wom === -1) {
          const nextWeekSameDay = new Date(year, month, day + 7);
          return nextWeekSameDay.getMonth() !== month;
        } else {
          const nth = Math.floor((day - 1) / 7) + 1;
          return nth === wom;
        }
      }
    }
    return false;
  };

  const getReminderStatus = (reminder: any, viewDate: Date) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const vDate = new Date(viewDate);
    vDate.setHours(0, 0, 0, 0);

    const isDueOnViewDate = checkExactMatch(reminder, vDate);
    if (isDueOnViewDate) return { active: true, isOverdue: vDate < now };

    return { active: false, isOverdue: false };
  };

  useEffect(() => {
    if (route.params?.date) {
      const [year, month, day] = route.params.date.split('-').map(Number);
      setSelectedDate(new Date(year, month - 1, day));
      navigation.setParams({ date: undefined });
    }
  }, [route.params?.date]);

  const fetchEntries = useCallback(async () => {
    const gen = ++fetchGenRef.current;
    const viewDate = selectedDateRef.current;
    const dateStr =
      viewDate.getFullYear() +
      '-' +
      ('0' + (viewDate.getMonth() + 1)).slice(-2) +
      '-' +
      ('0' + viewDate.getDate()).slice(-2);

    // Only clear readiness when the viewed date changes — same-date focus refetch
    // must not flip the Journal card incomplete (looks like a tap toggle).
    if (habitsLoadedForDateRef.current !== dateStr) {
      setHabitsReady(false);
    }

    try {
      const [settings, journalEntries] = await Promise.all([
        getJournalSettings().catch(() => null),
        getJournalEntries(dateStr).catch(() => []),
      ]);
      if (gen !== fetchGenRef.current) return;
      setJournalSettings(settings);
      setEntries(journalEntries);
    } catch (e) {
      if (gen !== fetchGenRef.current) return;
      console.warn('Journal fetch flow error:', e);
    }

    try {
      const [habitData, taskData, eventData, categoryData, transactionData, projectData] =
        await Promise.all([
          getHabitsForDate(dateStr),
          getTasksForDate(dateStr),
          getEventsForDate(dateStr),
          getCategories().catch(() => []),
          getTransactions().catch(() => []),
          getProjects().catch(() => []),
        ]);

      if (gen !== fetchGenRef.current) return;

      setHabits(habitData);
      habitsLoadedForDateRef.current = dateStr;
      setHabitsReady(true);
      setTasks(taskData);
      setProjects(Array.isArray(projectData) ? projectData : []);
      setEvents(eventData);
      setCategories(categoryData);
      setTransactions(transactionData);
      setError(null);
    } catch (e) {
      if (gen !== fetchGenRef.current) return;
      console.error('Critical timeline fetch failed:', e);
      // Keep prior readiness if this was a same-date refresh failure.
      if (habitsLoadedForDateRef.current !== dateStr) {
        setHabitsReady(false);
      }
      setError("Couldn't load today.");
    }
  }, []);

  useEffect(() => {
    if (isFocused) void fetchEntries();
  }, [selectedDate, isFocused, fetchEntries]);

  const timeParam = pendingHour
    ? `${String(pendingHour.hour).padStart(2, '0')}:${String(pendingHour.minute).padStart(2, '0')}`
    : undefined;

  const handleOptionPress = (option: string) => {
    setModalVisible(false);
    const dateStr = toLocalDateString(selectedDate);
    const time = timeParam;
    setPendingHour(null);
    if (option === 'Journal') {
      navigation.navigate('JournalEntry', { entry: entries[0], date: dateStr });
    } else if (option === 'Habit') {
      navigation.navigate('HabitEntry');
    } else if (option === 'Task') {
      navigation.navigate('TaskEntry', { date: dateStr, time });
    } else if (option === 'Event') {
      navigation.navigate('EventEntry', { date: dateStr, time });
    } else if (option === 'Finance') {
      navigation.navigate('TransactionEntry');
    }
  };

  const handleAddAtHour = (hour: number, minute = 0) => {
    setPendingHour({ hour, minute });
    setModalVisible(true);
  };

  const isToday = toLocalDateString(selectedDate) === toLocalDateString(new Date());
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
  };

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const budgetDueDates: any[] = [];
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const traverse = (cats: any[]) => {
    cats.forEach(cat => {
      if (cat.is_active === false) return;

      // Skip items created after the viewed month
      if (cat.created_at) {
        const created = parseLocalDate(cat.created_at.split('T')[0]);
        if (created.getFullYear() > currentYear || (created.getFullYear() === currentYear && created.getMonth() > currentMonth)) {
          return;
        }
      }
      
      if (cat.due_dates && Array.isArray(cat.due_dates)) {
        // Get transactions for this specific subcategory in current month
        const catTransactions = transactions.filter(t => 
          (t.subcategory === cat.id || (!t.subcategory && t.category === cat.id)) &&
          parseLocalDate(t.date).getMonth() === currentMonth &&
          parseLocalDate(t.date).getFullYear() === currentYear
        );
        const totalPaid = catTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

        // Sort due dates by their occurrence in the month
        const sortedDueDates = [...cat.due_dates].sort((a, b) => {
          const dayA = a.day_of_month === -1 ? 32 : (a.day_of_month || 0);
          const dayB = b.day_of_month === -1 ? 32 : (b.day_of_month || 0);
          return dayA - dayB;
        });

        let cumulativeDue = 0;
        sortedDueDates.forEach((rem: any) => {
          const amount = parseFloat(rem.amount);
          cumulativeDue += amount;
          
          // If total paid so far covers this due date (and previous ones), skip it
          if (totalPaid >= cumulativeDue) return;

          const status = getReminderStatus(rem, selectedDate);
          if (status.active) {
            const iconObj = FINANCE_ICONS.find(i => i.name === cat.icon);
            budgetDueDates.push({
              id: `br-${rem.id}`,
              title: `${cat.name}: ${rem.description || 'Payment'}`,
              timeRange: status.isOverdue ? `OVERDUE · ${formatMoney(amount)}` : formatMoney(amount),
              startTime: null,
              type: 'finance',
              icon: iconObj?.icon,
              isActive: true,
              isOverdue: status.isOverdue
            });
          }
        });
      }
      
      if (cat.children && Array.isArray(cat.children)) {
        traverse(cat.children);
      }
    });
  };
  traverse(categories);


  const dateStr = selectedDate.getFullYear() + '-' + 
    ('0' + (selectedDate.getMonth() + 1)).slice(-2) + '-' + 
    ('0' + selectedDate.getDate()).slice(-2);

  const metrics = useMemo(
    () => [
      ...buildTaskHabitMetrics({
        tasks,
        habits,
        entityColors: { tasks: entityColors.tasks, habits: entityColors.habits },
      }),
      // Events have no completion state — honest count only.
      buildEventCountMetric(events, entityColors.events),
      // Finance dues are outstanding reminders, not a completion ring.
      buildDueCountMetric(budgetDueDates, entityColors.finance),
    ],
    [tasks, habits, events, budgetDueDates, entityColors],
  );

  const agendaItems: AgendaItem[] = useMemo(() => {
    const journalItems: AgendaItem[] = journalSettings
      ? (() => {
          const entry = entries[0] ?? null;
          const reviewComplete = isJournalDayReviewComplete({
            moodScore: entry?.mood_score,
            energyScore: entry?.energy_score,
            habits: habits.map((h: any) => ({ id: Number(h.id), status: h.status })),
            habitsReady,
          });
          const journalState = getJournalTimelineState(
            selectedDate,
            journalSettings,
            entry,
            reviewComplete,
          );
          if (!journalState.shouldAppearInTimeline) return [];
          return [
            {
              id: 'journal',
              title: journalState.timelineState === 'completed' ? 'Journal Completed' : 'Journal',
              startTime: journalState.scheduledTime
                ? new Date(`${dateStr}T${journalState.scheduledTime}`)
                : new Date(`${dateStr}T09:00:00`),
              type: 'journal' as const,
              timeRange: journalState.scheduledTime
                ? journalState.scheduledTime.substring(0, 5)
                : '09:00',
              isActive: journalState.timelineState !== 'completed',
              isCompleted: journalState.timelineState === 'completed',
              // Read-only status badge — never attach onToggle (derived review coverage).
              badge: journalState.timelineState === 'completed' ? ('check' as const) : null,
            },
          ];
        })()
      : [];

    return [
      ...events.map((e: any) => ({
        id: `e-${e.id}`,
        title: e.name,
        location: e.location,
        startTime: new Date(`${dateStr}T${e.start_time}`),
        durationMinutes: durationMinutesFromField(e.duration),
        type: 'event' as const,
        timeRange: e.start_time,
        isActive: true,
      })),
      ...tasks.map((t: any) => ({
        id: `t-${t.id}`,
        title: t.name,
        projectName: projects.find((p) => p.id === t.project)?.name,
        startTime: t.due_time ? new Date(`${dateStr}T${t.due_time}`) : null,
        durationMinutes: durationMinutesFromField(t.duration),
        type: 'task' as const,
        timeRange: t.due_time || '',
        isActive: false,
        isCompleted: t.status === 'COMPLETED',
        badge: t.status === 'COMPLETED' ? ('check' as const) : null,
        onToggle: async () => {
          const key = `task-${t.id}`;
          if (completionLockRef.current.has(key)) return;
          completionLockRef.current.add(key);
          const wasCompleted = t.status === 'COMPLETED';
          setTasks((prev) =>
            prev.map((task) =>
              task.id === t.id
                ? { ...task, status: wasCompleted ? 'PENDING' : 'COMPLETED' }
                : task,
            ),
          );
          try {
            await toggleTaskCompletion(t.id);
            await fetchEntries();
          } catch (e) {
            setTasks((prev) =>
              prev.map((task) =>
                task.id === t.id
                  ? { ...task, status: wasCompleted ? 'COMPLETED' : 'PENDING' }
                  : task,
              ),
            );
            setError("Couldn't update this task.");
          } finally {
            completionLockRef.current.delete(key);
          }
        },
      })),
      ...habits.map((h: any) => ({
        id: `h-${h.id}`,
        title: h.name,
        startTime: h.reminder_time ? new Date(`${dateStr}T${h.reminder_time}`) : null,
        type: 'habit' as const,
        timeRange: h.reminder_time || '',
        icon: resolveHabitIcon(h.icon),
        isActive: false,
        isCompleted: h.completed,
        badge: h.completed ? ('check' as const) : null,
        onToggle: async () => {
          const key = `habit-${h.id}`;
          if (completionLockRef.current.has(key)) return;
          completionLockRef.current.add(key);
          const wasCompleted = !!h.completed || h.status === 'COMPLETED';
          // Keep `status` in sync — Journal timeline completion reads status, not `completed`.
          setHabits((prev) =>
            prev.map((habit) =>
              habit.id === h.id
                ? {
                    ...habit,
                    completed: !wasCompleted,
                    status: wasCompleted ? 'PENDING' : 'COMPLETED',
                  }
                : habit,
            ),
          );
          try {
            await toggleHabitCompletion(h.id, dateStr);
            await fetchEntries();
          } catch (e) {
            setHabits((prev) =>
              prev.map((habit) =>
                habit.id === h.id
                  ? {
                      ...habit,
                      completed: wasCompleted,
                      status: wasCompleted ? 'COMPLETED' : 'PENDING',
                    }
                  : habit,
              ),
            );
            setError("Couldn't update this habit.");
          } finally {
            completionLockRef.current.delete(key);
          }
        },
      })),
      ...budgetDueDates,
      ...journalItems,
    ];
  }, [
    events,
    tasks,
    habits,
    habitsReady,
    projects,
    budgetDueDates,
    journalSettings,
    selectedDate,
    entries,
    dateStr,
    fetchEntries,
  ]);

  return (
    <ScreenLayout 
      title={isToday ? 'Today' : formatDate(selectedDate)}
      rightOption={{
        render: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ActionButton
              icon={IconUser}
              onPress={() => navigation.navigate('Profile')}
              size={40}
              accessibilityLabel="Profile"
            />
            <ActionButton
              icon={IconPlus}
              onPress={() => {
                setPendingHour(null);
                setModalVisible(true);
              }}
              size={40}
              accessibilityLabel="Add item"
            />
          </View>
        ),
      }}
      onTitlePress={() => setShowPicker(!showPicker)}
      showPicker={showPicker}
      contentStyle={{ paddingHorizontal: 0 }}
      constrainWidth={false}
    >
      <View style={styles.root}>
        <View style={{ paddingHorizontal: 16 }}>
          <ErrorMessage message={error} />
        </View>

        <DayMetricStrip metrics={metrics} />

        <View style={styles.timeline}>
          <TimelineAgenda
            now={isToday ? new Date() : null}
            items={agendaItems}
            onAddAtHour={handleAddAtHour}
            onItemPress={(item: AgendaItem) => {
              // Journal: navigation only — never mutate derived completion from the card.
              if (
                handleJournalAgendaPress(item, {
                  navigateToJournalTab: () => navigation.navigate('Journal'),
                }) === 'navigated-journal'
              ) {
                return;
              }

              const target = resolveAgendaEditorTarget(item);
              if (target.kind === 'unsupported' || target.kind === 'journal') return;

              // MainStack modal (same pattern as Profile) — keeps Today mounted underneath.
              navigation.navigate('ItemDetails', {
                kind: target.kind,
                entityId: target.entityId,
                occurrenceDate: dateStr,
                projectName: item.projectName,
                isCompleted: !!item.isCompleted,
              });
            }}
          />
        </View>
      </View>

      <CreateNewModal 
        visible={modalVisible} 
        onClose={() => {
          setModalVisible(false);
          setPendingHour(null);
        }}
        onSelect={handleOptionPress}
      />

      <CalendarPickerModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  timeline: { flex: 1 },
});
