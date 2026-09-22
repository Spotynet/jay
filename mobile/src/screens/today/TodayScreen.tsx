import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';
import { IconPlus, IconUser, IconFlame, IconCoin } from 'tabler-icons-react-native';
import ScreenLayout from '../../components/common/ScreenLayout';
import { AppText } from '../../components/ui/AppText';
import { getJournalEntries, getJournalSettings } from '../../api/journal';
import { getHabitsForDate, getHabitById, toggleHabitCompletion } from '../../api/habits';
import { getTasksForDate, getTaskById, toggleTaskCompletion } from '../../api/tasks';
import { getEventsForDate, getEventById } from '../../api/events';
import { getCategories, getTransactions } from '../../api/finance';
import { ActionButton } from '../../components/common/ActionButton';
import CalendarPickerModal from '../../components/common/CalendarPickerModal';
import { TimelineAgenda } from '../../components/common/TimelineAgenda';
import { CreateNewModal } from './components/CreateNewModal';
import { FINANCE_ICONS } from '../../constants/financeIcons';
import { getJournalTimelineState, JournalSettings } from '../../utils/journalScheduling';
import { DetailsModal } from '../../components/common/DetailsModal';
import { toLocalDateString, parseLocalDate } from '../../utils/date';

export default function TodayScreen() {
  const { colors, entityColors } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [journalSettings, setJournalSettings] = useState<JournalSettings | null>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  
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

  const fetchEntries = async () => {
    const dateStr = selectedDate.getFullYear() + '-' + 
      ('0' + (selectedDate.getMonth() + 1)).slice(-2) + '-' + 
      ('0' + selectedDate.getDate()).slice(-2);
    
    try {
        const [settings, journalEntries] = await Promise.all([
            getJournalSettings().catch(() => null),
            getJournalEntries(dateStr).catch(() => [])
        ]);
        setJournalSettings(settings);
        setEntries(journalEntries);
    } catch (e) {
        console.warn('Journal fetch flow error:', e);
    }

    try {
        const [habitData, taskData, eventData, categoryData, transactionData] = await Promise.all([
            getHabitsForDate(dateStr),
            getTasksForDate(dateStr),
            getEventsForDate(dateStr),
            getCategories().catch(() => []),
            getTransactions().catch(() => [])
        ]);
        
        setHabits(habitData);
        setTasks(taskData);
        setEvents(eventData);
        setCategories(categoryData);
        setTransactions(transactionData);
    } catch (e) {
        console.error('Critical timeline fetch failed:', e);
    }
  };

  useEffect(() => {
    if (isFocused) fetchEntries();
  }, [selectedDate, isFocused]);

  const handleOptionPress = (option: string) => {
    setModalVisible(false);
    const dateStr = toLocalDateString(selectedDate);
    if (option === 'Journal') {
      navigation.navigate('JournalEntry', { entry: entries[0], date: dateStr });
    } else if (option === 'Habit') {
      navigation.navigate('HabitEntry');
    } else if (option === 'Task') {
      navigation.navigate('TaskEntry');
    } else if (option === 'Event') {
      navigation.navigate('EventEntry');
    } else if (option === 'Finance') {
      navigation.navigate('TransactionEntry');
    }
  };

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

  return (
    <ScreenLayout 
      title={formatDate(selectedDate)}
      rightOption={{ 
        render: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ActionButton icon={IconUser} onPress={() => navigation.navigate('Profile')} size={40} />
            <ActionButton icon={IconPlus} onPress={() => setModalVisible(true)} size={40} />
          </View>
        )
      }}
      onTitlePress={() => setShowPicker(!showPicker)}
      showPicker={showPicker}
      contentStyle={{ paddingHorizontal: 0 }}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 0 }}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryPill, { backgroundColor: `${entityColors.habits}12` }]}>
              <IconFlame size={14} color={entityColors.habits} />
              <AppText style={[styles.summaryCount, { color: entityColors.habits }]}>
                {habits.filter((h: any) => h.completed).length}/{habits.length}
              </AppText>
              <AppText style={[styles.summaryLabel, { color: colors.subtext }]}>Habits</AppText>
            </View>
            <View style={[styles.summaryPill, { backgroundColor: `${entityColors.finance}12` }]}>
              <IconCoin size={14} color={entityColors.finance} />
              <AppText style={[styles.summaryCount, { color: entityColors.finance }]}>
                {budgetDueDates.length}
              </AppText>
              <AppText style={[styles.summaryLabel, { color: colors.subtext }]}>Due</AppText>
            </View>
          </View>
        </View>

        <View style={{ flex: 1 }}>
        <TimelineAgenda 
            items={[
                ...events.map((e: any) => ({
                      id: `e-${e.id}`,
                      title: e.name,
                      location: e.location,
                      startTime: new Date(`${dateStr}T${e.start_time}`),
                      durationMinutes: 30,
                      type: 'event',
                      timeRange: e.start_time,
                      isActive: true
                    })),
                ...tasks.map((t: any) => ({
                      id: `t-${t.id}`,
                      title: t.name,
                      startTime: t.due_time ? new Date(`${dateStr}T${t.due_time}`) : null,
                      durationMinutes: 15,
                      type: 'task',
                      timeRange: t.due_time || '',
                      isActive: false,
                      isCompleted: t.status === 'COMPLETED',
                      onToggle: async () => {
                          await toggleTaskCompletion(t.id);
                          fetchEntries();
                      }
                  })),
                ...habits.map((h: any) => ({
                    id: `h-${h.id}`,
                    title: h.name,
                    startTime: h.reminder_time ? new Date(`${dateStr}T${h.reminder_time}`) : null,
                    durationMinutes: 15,
                    type: 'habit',
                    timeRange: h.reminder_time || '',
                    isActive: false,
                    isCompleted: h.completed,
                    onToggle: async () => {
                      await toggleHabitCompletion(h.id, dateStr);
                      fetchEntries();
                    }
                })),
                ...budgetDueDates,
                ...(journalSettings ? (() => {
                  const journalState = getJournalTimelineState(selectedDate, journalSettings, entries[0]);
                  if (!journalState.shouldAppearInTimeline) return [];
                  return [{
                    id: 'journal',
                    title: journalState.timelineState === 'completed' ? 'Journal Completed' : 'Journal',
                    startTime: journalState.scheduledTime ? new Date(`${dateStr}T${journalState.scheduledTime}`) : new Date(`${dateStr}T09:00:00`),
                    durationMinutes: 15,
                    type: 'journal',
                    timeRange: journalState.scheduledTime ? journalState.scheduledTime.substring(0,5) : '09:00',
                    isActive: journalState.timelineState !== 'completed',
                    isCompleted: journalState.timelineState === 'completed',
                    onPress: () => navigation.navigate('JournalEntry', { entry: entries[0], date: dateStr })
                  }];
                })() : [])
            ]} 
            onItemPress={(item: any) => {
                if (item.type === 'journal' && item.onPress) {
                    item.onPress();
                    return;
                }
                setSelectedItem(item);
                setDetailsVisible(true);
            }}
        />
        </View>
      </ScrollView>

      <DetailsModal 
        visible={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        item={selectedItem}
        onToggle={async () => {
            if (selectedItem?.onToggle) {
                await selectedItem.onToggle();
                setSelectedItem((prev: any) => ({ ...prev, isCompleted: !prev.isCompleted }));
            }
        }}
        onEdit={async () => {
            setDetailsVisible(false);
            if (selectedItem.type === 'habit') {
                const habitData = await getHabitById(selectedItem.id.split('-')[1]);
                navigation.navigate('HabitEntry', { habit: habitData });
            } else if (selectedItem.type === 'task') {
                const taskData = await getTaskById(selectedItem.id.split('-')[1]);
                navigation.navigate('TaskEntry', { task: taskData });
            } else if (selectedItem.type === 'event') {
                const eventData = await getEventById(selectedItem.id.split('-')[1]);
                navigation.navigate('EventEntry', { event: eventData });
            }
        }}
      />

      <CreateNewModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
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
  contentContainer: { flex: 1 },
  summaryCard: { paddingHorizontal: 16, paddingVertical: 10 },
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryPill: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10 },
  summaryCount: { fontSize: 13, fontWeight: '700' },
  summaryLabel: { fontSize: 11, fontWeight: '500' },
});
