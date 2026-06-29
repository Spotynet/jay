import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SectionList, FlatList, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';
import { IconPlus } from 'tabler-icons-react-native';
import ScreenLayout from '../../components/common/ScreenLayout';
import JournalCard from '../../components/journal/JournalCard';
import HabitCard from '../../components/habits/HabitCard';
import TaskCard from '../../components/tasks/TaskCard';
import EventCard from '../../components/events/EventCard';
import { getJournalEntries, getJournalSettings } from '../../api/journal';
import { getHabitsForDate, getHabitById } from '../../api/habits';
import { getTasksForDate, getTaskById } from '../../api/tasks';
import { getEventsForDate, getEventById } from '../../api/events';
import { ActionButton } from '../../components/common/ActionButton';
import { DayScrollPicker } from '../../components/common/DayScrollPicker';
import { TimelineAgenda } from '../../components/common/TimelineAgenda';
import { CreateNewModal } from './components/CreateNewModal';
import { HabitChip } from '../../components/habits/HabitChip';
import { toggleHabitCompletion, incrementHabitProgress, decrementHabitProgress } from '../../api/habits';
import { toggleTaskCompletion } from '../../api/tasks';
// Add helper import
import { getJournalTimelineState, JournalSettings } from '../../utils/journalScheduling';
import { DetailsModal } from '../../components/common/DetailsModal';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

export default function TodayScreen() {
  const { colors } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [journalSettings, setJournalSettings] = useState<JournalSettings | null>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

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
    
    // Robustly fetch non-critical journal data in isolation
    try {
        const [settings, entries] = await Promise.all([
            getJournalSettings().catch(() => null),
            getJournalEntries(dateStr).catch(() => [])
        ]);
        setJournalSettings(settings);
        setEntries(entries);
    } catch (e) {
        console.warn('Journal fetch flow encountered a non-critical error:', e);
    }

    // Critical data for Today screen
    try {
        const [habitData, taskData, eventData] = await Promise.all([
            getHabitsForDate(dateStr),
            getTasksForDate(dateStr),
            getEventsForDate(dateStr)
        ]);
        
        setHabits(habitData);
        setTasks(taskData);
        setEvents(eventData);
    } catch (e) {
        console.error('Critical timeline fetch failed:', e);
    }
  };

  useEffect(() => {
    if (isFocused) fetchEntries();
  }, [selectedDate, isFocused]);

  const handleOptionPress = (option: string) => {
    setModalVisible(false);
    const dateStr = selectedDate.toISOString().split('T')[0];
    if (option === 'Journal') {
      navigation.navigate('JournalEntry', { 
        entry: entries.length > 0 ? entries[0] : null,
        date: dateStr 
      });
    } else if (option === 'Habit') {
      navigation.navigate('HabitEntry');
    } else if (option === 'Task') {
      navigation.navigate('TaskEntry');
    } else if (option === 'Event') {
      navigation.navigate('EventEntry');
    } else if (option === 'Finance') {
      navigation.navigate('FinanceEntry');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
  };

  const renderHabitList = () => (
    <View style={styles.habitContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={habits}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          console.log('Rendering Habit Item:', item.name, 'Stats:', item.stats);
          return (
            <View style={styles.chipWrapper}>
              <HabitChip 
              name={item.name} 
              iconName={item.icon}
              isCompleted={item.completed}
              progress={item.progress}
              targetValue={item.target_value}
              hasTarget={item.has_target}
              targetType={item.target_type}
              daysOfWeek={item.days_of_week}
              history={item.history}
              onToggle={async () => {                  setHabits(habits.map(h => h.id === item.id ? { ...h, completed: !h.completed } : h));
                  try {
                    await toggleHabitCompletion(item.id, selectedDate.toISOString().split('T')[0]);
                    fetchEntries();
                  } catch (e) {
                    fetchEntries();
                  }
                }}
                onIncrement={async () => {
                  setHabits(habits.map(h => h.id === item.id ? { ...h, progress: Math.min(h.progress + 1, h.target_value), completed: h.progress + 1 >= h.target_value } : h));
                  try {
                    await incrementHabitProgress(item.id, selectedDate.toISOString().split('T')[0]);
                    fetchEntries();
                  } catch (e) {
                    fetchEntries();
                  }
                }}
                onDecrement={async () => {
                  setHabits(habits.map(h => h.id === item.id ? { ...h, progress: Math.max(h.progress - 1, 0), completed: h.progress - 1 >= h.target_value } : h));
                  try {
                    await decrementHabitProgress(item.id, selectedDate.toISOString().split('T')[0]);
                    fetchEntries();
                  } catch (e) {
                    fetchEntries();
                  }
                }}
              />
            </View>
          );
        }}
      />
    </View>
  );

  const renderPageContent = () => {
    const dateStr = selectedDate.getFullYear() + '-' + 
      ('0' + (selectedDate.getMonth() + 1)).slice(-2) + '-' + 
      ('0' + selectedDate.getDate()).slice(-2);

    return (
      <View style={styles.contentContainer}>
        {showPicker && (
          <View style={styles.pickerWrapper}>
            <DayScrollPicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          </View>
        )}

        {habits.length > 0 && renderHabitList()}

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
                  ...(journalSettings ? (() => {
                    const journalState = getJournalTimelineState(selectedDate, journalSettings, entries.length > 0 ? entries[0] : null);
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
                      onPress: () => navigation.navigate('JournalEntry', { 
                        entry: entries.length > 0 ? entries[0] : null,
                        date: dateStr 
                      })
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
      </View>
    );
  };

  return (
    <ScreenLayout 
      title={formatDate(selectedDate)}
      rightOption={{ 
        icon: () => <ActionButton icon={IconPlus} onPress={() => setModalVisible(true)} size={40} />,
        onPress: () => setModalVisible(true) 
      }}
      onTitlePress={() => setShowPicker(!showPicker)}
      showPicker={showPicker}
      contentStyle={{ paddingHorizontal: 0 }}
    >
      {renderPageContent()}
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
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  contentContainer: { flex: 1 },
  habitContainer: { marginBottom: 15 },
  chipWrapper: { marginRight: 16, paddingTop: 15 },
  pickerWrapper: { marginBottom: 10 },
});
