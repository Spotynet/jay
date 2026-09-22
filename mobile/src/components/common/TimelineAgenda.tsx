import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AgendaCard } from './AgendaCard';
import { IconChevronDown, IconX } from 'tabler-icons-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface AgendaItem {
  id: string;
  title: string;
  type: string;
  timeRange: string;
  location?: string;
  isActive: boolean;
  isCompleted?: boolean;
  isOverdue?: boolean;
  onToggle?: () => void;
  startTime: Date | null;
  durationMinutes?: number;
}

interface TimelineAgendaProps {
  items: AgendaItem[];
  onItemPress?: (item: AgendaItem) => void;
}

const HOUR_HEIGHT = 180;
const SIDEBAR_WIDTH = 60;

const formatTime = (date: Date): string => {
  const h = date.getHours();
  const m = date.getMinutes();
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const TimelineAgenda = ({ items, onItemPress }: TimelineAgendaProps) => {
  const { accentColor, colors, entityColors } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [chipDismissed, setChipDismissed] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const scrollPosition = (currentTime.getHours() * HOUR_HEIGHT) - 50;
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: Math.max(0, scrollPosition), animated: true });
    }, 500);
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const nowTop = (currentTime.getHours() * 60 + currentTime.getMinutes()) / 60 * HOUR_HEIGHT;

  const allDayItems = items.filter(item => !item.startTime);
  const timedItems = items.filter(item => item.startTime !== null) as (AgendaItem & { startTime: Date })[];
  const sortedItems = [...timedItems].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  const slots: any = {};
  sortedItems.forEach(item => {
      const hour = item.startTime.getHours();
      if (!slots[hour]) slots[hour] = [];
      slots[hour].push(item);
  });

  // --- Option 1: "Later today" floating chip ---
  const futureItems = useMemo(() => {
    return sortedItems.filter(item => item.startTime.getTime() > currentTime.getTime());
  }, [sortedItems, currentTime]);

  const nextItem = futureItems.length > 0 ? futureItems[0] : null;

  const scrollToItem = (item: AgendaItem & { startTime: Date }) => {
    const targetY = (item.startTime.getHours() * HOUR_HEIGHT) - 50;
    scrollViewRef.current?.scrollTo({ y: Math.max(0, targetY), animated: true });
  };

  return (
    <View style={styles.container}>
      {allDayItems.length > 0 && (
        <View style={[styles.allDayContainer, { width: '100%' }]}>
            <View style={styles.allDayHeader}>
                <Text style={styles.noTimeLabel} numberOfLines={1}>No time</Text>
            </View>
            <ScrollView 
              style={styles.allDayScroll}
              nestedScrollEnabled 
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.allDayGrid}>
                  {allDayItems.map(item => (
                      <View key={item.id} style={styles.allDayCard}>
                          <AgendaCard
                              title={item.title}
                              type={item.type as any}
                              timeRange={item.timeRange}
                              location={item.location}
                              isActive={item.isActive}
                              isCompleted={item.isCompleted}
                              isOverdue={item.isOverdue}
                              onToggle={item.onToggle}
                              onPress={() => onItemPress && onItemPress(item)}
                          />
                      </View>
                  ))}
              </View>
            </ScrollView>
        </View>
      )}

      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {hours.map(hour => {
            const slotItems = slots[hour] || [];
            return (
                <View key={hour} style={[styles.hourRow, { height: HOUR_HEIGHT }]}>
                    <Text style={styles.hourLabel}>
                      {`${hour.toString().padStart(2, '0')}:00`}
                    </Text>
                    <View style={styles.slotContainer}>
                        {slotItems.map((item: any) => {
                             const startMinutes = item.startTime.getMinutes();
                             const top = (startMinutes / 60) * HOUR_HEIGHT;
                             
                             const isEvent = item.type === 'event';
                             const isTask = item.type === 'task';
                             const isResizable = isEvent || (isTask && item.durationMinutes);
                             const defaultDuration = isTask ? 15 : 30;
                             const duration = item.durationMinutes || defaultDuration;
                             const height = Math.max((duration / 60) * HOUR_HEIGHT, 40);
                             
                             const overlaps = sortedItems.filter((p: any) => 
                                 (item.startTime.getTime() < p.startTime.getTime() + (p.durationMinutes || defaultDuration) * 60000) &&
                                 (item.startTime.getTime() + duration * 60000 > p.startTime.getTime())
                             );
                             // Sort overlaps by priority: Events (0) > Tasks (1) > Habits (2) > Journal (3)
                             const priorityMap: any = { 'event': 0, 'task': 1, 'habit': 2, 'journal': 3 };
                             overlaps.sort((a: any, b: any) => (priorityMap[a.type] ?? 99) - (priorityMap[b.type] ?? 99));
                             
                             const numCols = overlaps.length;
                             const colIndex = overlaps.indexOf(item);
                             
                             return (
                                 <View key={item.id} style={[styles.flexCard, { 
                                     position: 'absolute', 
                                     top, 
                                     height: isResizable ? height : undefined,
                                     minHeight: isResizable ? height : 20,
                                     left: `${(colIndex * (100 / numCols))}%`, 
                                     width: `${100 / numCols}%` 
                                 }]}>
                                    <AgendaCard 
                                        title={item.title}
                                        type={item.type as any}
                                        timeRange={item.timeRange}
                                        location={item.location}
                                        isActive={item.isActive}
                                        isCompleted={item.isCompleted}
                                        onToggle={item.onToggle}
                                        onPress={() => onItemPress && onItemPress(item)}
                                        startTime={item.startTime}
                                        durationMinutes={item.durationMinutes}
                                        verticalAlign={!isResizable ? 'center' : 'flex-start'}
                                    />
                                 </View>
                             );
                        })}
                        <View style={styles.divider} />
                    </View>
                </View>
            );
        })}

        <View style={[styles.nowLine, { top: nowTop + 20, backgroundColor: accentColor }]}>
          <View style={[styles.nowBulb, { backgroundColor: accentColor }]} />
        </View>
      </ScrollView>

      {/* Option 1: "Later today" floating chip */}
      {futureItems.length > 0 && !chipDismissed && (
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={styles.floatingChipContainer}>
          <TouchableOpacity
            style={[styles.floatingChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => nextItem && scrollToItem(nextItem)}
            activeOpacity={0.8}
          >
            <IconChevronDown size={14} color={colors.subtext} stroke={2} style={{ marginRight: 2 }} />
            <Text style={[styles.floatingChipText, { color: colors.subtext }]}>
              {futureItems.length} later · {formatTime(nextItem!.startTime)}
            </Text>
            <View style={[styles.chipDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity onPress={() => setChipDismissed(true)} hitSlop={8}>
              <IconX size={12} color={colors.subtext} stroke={2} />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  allDayContainer: { borderBottomWidth: 0.5, borderBottomColor: '#222', paddingVertical: 10, maxHeight: 220 },
  allDayHeader: { marginBottom: 5 },
  noTimeLabel: { fontSize: 11, fontWeight: '400', color: '#666', letterSpacing: 2, marginLeft: 20 },
  allDayScroll: { flex: 1 },
  allDayGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 },
  allDayCard: { width: '47%' },
  scrollContent: { paddingBottom: 100 },
  hourRow: { flexDirection: 'row', alignItems: 'flex-start' },
  hourRowSmall: { flexDirection: 'row', alignItems: 'center' },
  hourLabel: { width: SIDEBAR_WIDTH, fontSize: 9, color: '#666', textAlign: 'center', paddingLeft: 0, textTransform: 'uppercase' },
  slotContainer: { flex: 1, flexDirection: 'row', position: 'relative', zIndex: 1 },
  divider: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 0.5, backgroundColor: '#222', zIndex: -1 },
  flexCard: { zIndex: 100 },
  nowLine: { position: 'absolute', left: SIDEBAR_WIDTH, right: 0, height: 1 },
  nowBulb: { position: 'absolute', left: -4, top: -4, width: 8, height: 8, borderRadius: 4 },

  // Option 1: "Later today" floating chip
  floatingChipContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 200,
  },
  floatingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 0.5,
    gap: 4,
  },
  floatingChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chipDivider: {
    width: 1,
    height: 12,
    marginHorizontal: 4,
  },
});
