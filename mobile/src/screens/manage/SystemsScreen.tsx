import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import ScreenLayout from '../../components/common/ScreenLayout';
import { SystemManagementCell } from '../../components/manage/SystemManagementCell';
import { ENTITY_ICONS } from '../../constants/entityIcons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getAllHabits } from '../../api/habits';
import { getJournalEntries } from '../../api/journal';
import { getEventsForDate } from '../../api/events';
import { getAllTasks } from '../../api/tasks';
import { toLocalDateString, parseLocalDate } from '../../utils/date';

export default function SystemsScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { colors } = useTheme();
  const [habits, setHabits] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (isFocused) {
        const todayStr = toLocalDateString(new Date());
        getAllHabits().then(setHabits).catch(console.error);
        getJournalEntries().then(setJournalEntries).catch(console.error);
        getEventsForDate(todayStr).then(setEvents).catch(console.error);
        getAllTasks().then(setTasks).catch(console.error);
    }
  }, [isFocused]);

  const getStreak = (daysOfWeek: number[], history: any[]) => {
    const toDateStr = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const completedDates = new Set(history.filter(h => h.completed).map(h => h.date));
    const now = new Date();
    
    let streak = 0;
    const todayIdx = (now.getDay() + 6) % 7;
    const todayStr = toDateStr(now);
    
    if (daysOfWeek.includes(todayIdx)) {
        if (completedDates.has(todayStr)) streak = 1;
    }
    
    let checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() - 1);
    
    while (true) {
      const dateStr = toDateStr(checkDate);
      const dayIdx = (checkDate.getDay() + 6) % 7;
      
      if (daysOfWeek.includes(dayIdx)) {
        if (completedDates.has(dateStr)) streak++;
        else break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
      if (streak > 365) break;
    }
    return streak;
  };

  const activeStreaksCount = habits.filter(h => getStreak(h.days_of_week || [], h.history || []) >= 3).length;

  const lastEntryDate = journalEntries.length > 0 
    ? parseLocalDate(journalEntries.sort((a,b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime())[0].date)
    : null;

  const getRelativeDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  };

  const upcomingEvent = events.length > 0 
    ? events.sort((a,b) => a.start_time.localeCompare(b.start_time))[0]
    : null;

  const nextEventMeta = upcomingEvent 
    ? `Next at ${new Date(`1970-01-01T${upcomingEvent.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'No upcoming events';

  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');
  const projectCount = new Set(tasks.filter(t => t.parent).map(t => t.parent)).size;

  return (
    <ScreenLayout title="MANAGE" contentStyle={styles.layoutOverride}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.slab, { borderColor: colors.border }]}>
            <SystemManagementCell title="Tasks" icon={ENTITY_ICONS.task} status={`${pendingTasks.length} Pending`} meta={`${projectCount} Project${projectCount === 1 ? '' : 's'}`} onPress={() => navigation.navigate('TasksSettings')} />
            <SystemManagementCell title="Events" icon={ENTITY_ICONS.event} status={`${events.length} Today`} meta={nextEventMeta} onPress={() => navigation.navigate('CalendarSettings')} />
            <SystemManagementCell title="Habits" icon={ENTITY_ICONS.habit} status={`${habits.length} Active`} meta={`${activeStreaksCount} active ${activeStreaksCount === 1 ? 'streak' : 'streaks'}`} onPress={() => navigation.navigate('HabitsSettings')} />
            <SystemManagementCell title="Journal" icon={ENTITY_ICONS.journal} status={`${journalEntries.length} Entries`} meta={lastEntryDate ? `Last: ${getRelativeDate(lastEntryDate)}` : 'No entries'} onPress={() => navigation.navigate('JournalSettings')} />
            <SystemManagementCell title="Fitness" icon={ENTITY_ICONS.workout} status="4 sessions" meta="Next tomorrow" onPress={() => navigation.navigate('WorkoutSettings')} />
            <SystemManagementCell title="Finance" icon={ENTITY_ICONS.finance} status="Accounts" meta="Add or edit accounts" onPress={() => navigation.navigate('Tabs', { screen: 'Financial' })} isLast />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  layoutOverride: { paddingHorizontal: 0 },
  container: { paddingBottom: 20 },
  slab: { borderTopWidth: 1, borderBottomWidth: 1, overflow: 'hidden', position: 'relative' },
});
