import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { IconChevronLeft, IconChevronRight, IconCalendar } from 'tabler-icons-react-native';
import ScreenLayout from '../../components/common/ScreenLayout';
import SectionCard from '../../components/common/SectionCard';
import CalendarPickerModal from '../../components/common/CalendarPickerModal';
import { FeelingsSection } from './components/FeelingsSection';
import { HabitRow } from './components/HabitRow';
import { getJournalEntries, createJournalEntry, updateJournalEntry } from '../../api/journal';
import { getHabitsForDate, setHabitStatus, incrementHabitProgress, decrementHabitProgress } from '../../api/habits';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { LinearGradient } from 'expo-linear-gradient';

function formatDateStr(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getWeekDays(center: Date) {
  const days: Date[] = [];
  const start = new Date(center);
  start.setDate(start.getDate() - 14);
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function DailyJournalScreen() {
  const { colors, entityColors, accentColor } = useTheme();
  const journalColor = entityColors.journal;
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();
  const flatListRef = useRef<FlatList>(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [journalEntry, setJournalEntry] = useState<any>(null);
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [energyScore, setEnergyScore] = useState<number | null>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const dateStr = formatDateStr(selectedDate);

  const journalEntryRef = useRef(journalEntry);
  const moodScoreRef = useRef(moodScore);
  const energyScoreRef = useRef(energyScore);
  const dateStrRef = useRef(dateStr);
  const savePromiseRef = useRef<Promise<void> | null>(null);

  journalEntryRef.current = journalEntry;
  moodScoreRef.current = moodScore;
  energyScoreRef.current = energyScore;
  dateStrRef.current = dateStr;

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  useEffect(() => {
    const idx = weekDays.findIndex(d => isSameDay(d, selectedDate));
    if (idx >= 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
      }, 100);
    }
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const [journalData, habitsData] = await Promise.all([
        getJournalEntries(dateStr),
        getHabitsForDate(dateStr),
      ]);

      if (journalData.length > 0) {
        const entry = journalData[0];
        setJournalEntry(entry);
        setMoodScore(entry.mood_score ?? null);
        setEnergyScore(entry.energy_score ?? null);
      } else {
        setJournalEntry(null);
        setMoodScore(null);
        setEnergyScore(null);
      }

      setHabits(habitsData);
      setError(null);
    } catch (e) {
      console.error('Failed to fetch journal data:', e);
      setError("Couldn't load your journal.");
    }
  };

  useEffect(() => {
    const load = async () => {
      if (savePromiseRef.current) await savePromiseRef.current;
      fetchData();
    };
    if (isFocused) load();
  }, [selectedDate, isFocused]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [selectedDate]);

  const saveJournalEntry = useCallback(async (mood: number | null, energy: number | null) => {
    const promise = (async () => {
      try {
        setSaving(true);
        const data = {
          date: dateStrRef.current,
          mood_score: mood,
          energy_score: energy,
          custom_ratings: journalEntryRef.current?.custom_ratings || [],
        };
        if (journalEntryRef.current) {
          const updated = await updateJournalEntry(journalEntryRef.current.id, data);
          setJournalEntry(updated);
        } else if (mood || energy) {
          const newEntry = await createJournalEntry(data);
          setJournalEntry(newEntry);
          journalEntryRef.current = newEntry;
        }
        setError(null);
      } catch (e) {
        console.error('Auto-save failed:', e);
        setError("Couldn't save your journal.");
      } finally {
        setSaving(false);
      }
    })();
    savePromiseRef.current = promise;
    await promise;
    savePromiseRef.current = null;
  }, []);

  const handleMoodChange = useCallback((val: number | null) => {
    setMoodScore(val);
    saveJournalEntry(val, energyScoreRef.current);
  }, [saveJournalEntry]);

  const handleEnergyChange = useCallback((val: number | null) => {
    setEnergyScore(val);
    saveJournalEntry(moodScoreRef.current, val);
  }, [saveJournalEntry]);

  const handleSetStatus = async (habitId: number, date: string, status: 'PENDING' | 'COMPLETED' | 'SKIPPED' | 'FAILED') => {
    setHabits(habits.map(h => h.id === habitId ? { ...h, status, completed: status === 'COMPLETED' } : h));
    try { await setHabitStatus(habitId, date, status); fetchData(); }
    catch { await fetchData(); setError("Couldn't update this habit."); }
  };

  const handleIncrementHabit = async (habitId: number, date: string) => {
    setHabits(habits.map(h => h.id === habitId ? { ...h, progress: Math.min(h.progress + 1, h.target_value), completed: h.progress + 1 >= h.target_value } : h));
    try { await incrementHabitProgress(habitId, date); fetchData(); }
    catch { await fetchData(); setError("Couldn't update this habit."); }
  };

  const handleDecrementHabit = async (habitId: number, date: string) => {
    setHabits(habits.map(h => h.id === habitId ? { ...h, progress: Math.max(h.progress - 1, 0), completed: h.progress - 1 >= h.target_value } : h));
    try { await decrementHabitProgress(habitId, date); fetchData(); }
    catch { await fetchData(); setError("Couldn't update this habit."); }
  };

  const isToday = isSameDay(selectedDate, new Date());

  const shiftDay = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d);
  };

  const renderDay = ({ item, index }: { item: Date; index: number }) => {
    const selected = isSameDay(item, selectedDate);
    const today = isSameDay(item, new Date());
    const sameMonth = item.getMonth() === selectedDate.getMonth();
    const letter = DAY_LETTERS[item.getDay()];
    const num = item.getDate();
    const dimmed = !selected && !today;

    return (
      <TouchableOpacity
        onPress={() => setSelectedDate(item)}
        activeOpacity={0.6}
        style={[styles.dayCell, dimmed && { opacity: 0.35 }]}
      >
        <AppText style={[
          styles.dayLetter,
          { color: selected ? accentColor : today ? colors.text : colors.subtext },
          !sameMonth && { opacity: 0.25 },
        ]}>
          {letter}
        </AppText>
        {selected ? (
          <View style={[styles.dayNumWrap, { backgroundColor: accentColor }]}>
            <AppText style={[styles.dayNum, styles.dayNumSelected, { color: '#fff' }]}>{num}</AppText>
          </View>
        ) : (
          <View style={[
            styles.dayNumWrap,
            today && { borderWidth: 1, borderColor: colors.subtext + '40' },
          ]}>
            <AppText style={[styles.dayNum, { color: colors.subtext }, !sameMonth && { opacity: 0.4 }]}>
              {num}
            </AppText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenLayout
      title="JOURNAL"
      contentStyle={{ paddingHorizontal: 0 }}
      rightOption={{
        icon: IconCalendar,
        onPress: () => setShowCalendar(true),
      }}
    >
      {saving && (
        <Animated.View entering={FadeInDown.duration(300)} exiting={FadeOut.duration(200)} style={styles.saveIndicatorWrap}>
          <View style={[styles.saveIndicator, { backgroundColor: journalColor }]} />
        </Animated.View>
      )}

      <View style={{ paddingHorizontal: 16 }}>
        <ErrorMessage message={error} />
      </View>

      {/* Date Hero */}
      <View style={styles.dateHero}>
        <Animated.View key={dateStr} entering={FadeIn.duration(250)} style={styles.dateTextWrap}>
          <AppText style={[styles.dateSub, { color: colors.subtext }]} numberOfLines={1}>
            {`${selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}, ${selectedDate.toLocaleDateString('en-US', { month: 'long' })} ${selectedDate.getDate()} ${selectedDate.getFullYear()}`.toUpperCase()}
          </AppText>
        </Animated.View>
        <TouchableOpacity
          style={[styles.todayBtn, isToday && styles.todayBtnHidden]}
          onPress={() => setSelectedDate(new Date())}
          disabled={isToday}
          activeOpacity={0.6}
        >
          <AppText style={[styles.todayBtnText, { color: accentColor }]}>TODAY</AppText>
        </TouchableOpacity>
      </View>

      {/* Day Strip */}
      <View style={styles.dayStripWrap}>
        <FlatList
          ref={flatListRef}
          data={weekDays}
          renderItem={renderDay}
          keyExtractor={(item) => item.toISOString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={44}
          decelerationRate="fast"
          style={styles.dayList}
          contentContainerStyle={styles.dayStripContent}
          getItemLayout={(_, index) => ({
            length: 44,
            offset: 44 * index,
            index,
          })}
        />
        <LinearGradient
          colors={['transparent', colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.edgeLeft}
          pointerEvents="none"
        />
        <LinearGradient
          colors={[colors.background, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.edgeRight}
          pointerEvents="none"
        />
        <View style={styles.chevronSlotLeft} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => shiftDay(-1)}
            style={styles.chevronBtn}
            activeOpacity={0.6}
          >
            <Icon name={IconChevronLeft} size={16} color={colors.subtext} />
          </TouchableOpacity>
        </View>
        <View style={styles.chevronSlotRight} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => shiftDay(1)}
            style={styles.chevronBtn}
            activeOpacity={0.6}
          >
            <Icon name={IconChevronRight} size={15} color={colors.subtext} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={journalColor} />}
      >
        <SectionCard title="FEELINGS">
          <FeelingsSection
            moodScore={moodScore}
            energyScore={energyScore}
            onMoodChange={handleMoodChange}
            onEnergyChange={handleEnergyChange}
          />
        </SectionCard>

        {habits.length > 0 && (
          <SectionCard
            title="HABITS"

            cardStyle={{ padding: 0, overflow: 'hidden' }}
            accessory={
              <TouchableOpacity
                onPress={() => navigation.navigate('HabitsSettings')}
                style={styles.manageBtn}
                activeOpacity={0.6}
              >
                <AppText style={[styles.manageText, { color: colors.subtext }]}>MANAGE</AppText>
                <Icon name={IconChevronRight} size={13} color={colors.subtext} />
              </TouchableOpacity>
            }
          >
            <View style={styles.habitsWrap}>
              {habits.map((habit, index) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  date={dateStr}
                  onSetStatus={handleSetStatus}
                  onIncrement={handleIncrementHabit}
                  onDecrement={handleDecrementHabit}
                  isLast={index === habits.length - 1}
                />
              ))}
            </View>
          </SectionCard>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <CalendarPickerModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        selectedDate={selectedDate}
        onSelect={(date) => {
          setShowCalendar(false);
          setTimeout(() => setSelectedDate(date), 300);
        }}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  saveIndicatorWrap: {
    paddingHorizontal: 15,
    paddingBottom: 8,
  },
  saveIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    opacity: 0.5,
  },
  dateHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
    paddingHorizontal: 15,
    paddingBottom: 16,
  },
  dateTextWrap: {
    flex: 1,
  },
  dateSub: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
  },
  todayBtn: {
    height: 30,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  todayBtnHidden: {
    opacity: 0,
  },
  chevronBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayBtnText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  dayStripWrap: {
    marginBottom: 16,
  },
  dayList: {
    width: '100%',
  },
  edgeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 24,
  },
  edgeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 24,
  },
  chevronSlotLeft: {
    position: 'absolute',
    left: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronSlotRight: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayStripContent: {
    paddingHorizontal: 4,
    gap: 0,
  },
  dayCell: {
    width: 44,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  dayLetter: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dayNumWrap: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNum: {
    fontSize: 13,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  dayNumSelected: {
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 15,
    gap: 20,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingLeft: 8,
  },
  manageText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  habitsWrap: {},
});
