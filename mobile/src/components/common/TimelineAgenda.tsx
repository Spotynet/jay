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
  projectName?: string;
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
  now?: Date | null;
}

const COMPACT_HEIGHT = 32;
const NO_TIME_CARD_HEIGHT = 32;
const EXPANDED_HEIGHT = 120;
const SIDEBAR_WIDTH = 60;

type TimedItem = AgendaItem & { startTime: Date };

type HourLayout = {
  hour: number;
  height: number;
  y: number;
};

const formatTime = (date: Date): string => {
  const h = date.getHours();
  const m = date.getMinutes();
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

function durationMinutesOf(item: AgendaItem): number {
  if (item.durationMinutes && item.durationMinutes > 0) return item.durationMinutes;
  return 0;
}

function buildHourLayouts(items: TimedItem[], now: Date | null): HourLayout[] {
  const busy = Array.from({ length: 24 }, () => false);
  items.forEach((item) => {
    const startMs = item.startTime.getTime();
    const minutes = durationMinutesOf(item);
    const endMs = startMs + (minutes > 0 ? minutes * 60_000 : 1);
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(item.startTime);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = hourStart.getTime() + 60 * 60_000;
      if (startMs < hourEnd && endMs > hourStart.getTime()) busy[hour] = true;
    }
  });
  if (now) busy[now.getHours()] = true;

  const layouts: HourLayout[] = [];
  let y = 0;
  for (let hour = 0; hour < 24; hour++) {
    const height = busy[hour] ? EXPANDED_HEIGHT : COMPACT_HEIGHT;
    layouts.push({ hour, height, y });
    y += height;
  }
  return layouts;
}

function yForTime(date: Date, layouts: HourLayout[]): number {
  const layout = layouts[date.getHours()];
  if (layout.height === EXPANDED_HEIGHT) {
    return layout.y + (date.getMinutes() / 60) * EXPANDED_HEIGHT;
  }
  return layout.y;
}

export const TimelineAgenda = ({ items, onItemPress, now = null }: TimelineAgendaProps) => {
  const { accentColor, colors, entityColors } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [chipDismissed, setChipDismissed] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const allDayItems = items.filter(item => !item.startTime);
  const timedItems = items.filter(item => item.startTime !== null) as TimedItem[];
  const sortedItems = [...timedItems].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  const showNow = now != null;
  const layouts = buildHourLayouts(sortedItems, showNow ? currentTime : null);
  const contentHeight = layouts.reduce((sum, layout) => sum + layout.height, 0);
  const layoutKey = layouts.map((layout) => layout.height).join(',');
  const nowTop = showNow ? yForTime(currentTime, layouts) : 0;

  useEffect(() => {
    if (!showNow) return;
    const scrollPosition = yForTime(currentTime, layouts) - 50;
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: Math.max(0, scrollPosition), animated: true });
    }, 500);
    return () => clearTimeout(timer);
  }, [layoutKey, showNow]);
  
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

  const scrollToItem = (item: TimedItem) => {
    const targetY = yForTime(item.startTime, layouts) - 50;
    scrollViewRef.current?.scrollTo({ y: Math.max(0, targetY), animated: true });
  };

  return (
    <View style={styles.container}>
      {allDayItems.length > 0 && (
        <View style={[styles.allDayContainer, { width: '100%' }]}>
            <View style={styles.allDayHeader}>
                <Text style={[styles.noTimeLabel, { color: colors.subtext }]} numberOfLines={1}>No time</Text>
                <Text style={[styles.noTimeCount, { color: colors.subtext }]}>{allDayItems.length}</Text>
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
                              compact
                              title={item.title}
                              type={item.type as any}
                              timeRange={item.timeRange}
                              location={item.location}
                              projectName={item.projectName}
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
        style={[styles.timelineScroll, { maxHeight: contentHeight }]}
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { height: contentHeight }]}
      >
        {layouts.map((layout) => {
            const hour = layout.hour;
            const slotItems = slots[hour] || [];
            const expanded = layout.height === EXPANDED_HEIGHT;
            const prevExpanded = hour > 0 && layouts[hour - 1].height === EXPANDED_HEIGHT;
            const nextExpanded = hour < 23 && layouts[hour + 1].height === EXPANDED_HEIGHT;
            const rowStyle = expanded ? styles.hourRow : styles.hourRowSmall;
            return (
                <View key={hour} style={[rowStyle, { height: layout.height }]}>
                    <View style={[styles.hourSide, !expanded && styles.hourSideCompact]}>
                      <Text style={[styles.hourLabel, { color: colors.subtext }]}>
                        {`${hour.toString().padStart(2, '0')}:00`}
                      </Text>
                      {expanded && (
                        <View
                          style={[
                            styles.rail,
                            {
                              backgroundColor: colors.subtext,
                              top: prevExpanded ? 0 : 6,
                              bottom: nextExpanded ? 0 : 8,
                            },
                          ]}
                        />
                      )}
                      {expanded && (
                        <View style={[styles.railDot, { backgroundColor: accentColor, borderColor: colors.background }]} />
                      )}
                      {expanded && (
                        <>
                          <Text style={[styles.hourLabel, styles.halfLabel, { color: colors.subtext }]}>
                            {`${hour.toString().padStart(2, '0')}:30`}
                          </Text>
                          <View style={[styles.halfTick, { backgroundColor: colors.subtext }]} />
                        </>
                      )}
                    </View>
                    <View style={styles.slotContainer}>
                        {slotItems.map((item: any) => {
                             const startMinutes = item.startTime.getMinutes();
                             const top = (startMinutes / 60) * EXPANDED_HEIGHT;
                             const hasDuration = durationMinutesOf(item) > 0;
                             const duration = durationMinutesOf(item);
                             const height = hasDuration
                               ? Math.max((duration / 60) * EXPANDED_HEIGHT, 40)
                               : NO_TIME_CARD_HEIGHT;
                             
                             const overlaps = sortedItems.filter((p) => {
                                 const otherDuration = durationMinutesOf(p);
                                 const otherEnd = p.startTime.getTime() + (otherDuration > 0 ? otherDuration * 60_000 : 1);
                                 const itemEnd = item.startTime.getTime() + (duration > 0 ? duration * 60_000 : 1);
                                 return item.startTime.getTime() < otherEnd && itemEnd > p.startTime.getTime();
                             });
                             // Sort overlaps by priority: Events (0) > Tasks (1) > Habits (2) > Journal (3)
                             const priorityMap: any = { 'event': 0, 'task': 1, 'habit': 2, 'journal': 3 };
                             overlaps.sort((a: any, b: any) => (priorityMap[a.type] ?? 99) - (priorityMap[b.type] ?? 99));
                             
                             const numCols = overlaps.length;
                             const colIndex = overlaps.indexOf(item);
                             
                             return (
                                 <View key={item.id} style={[styles.flexCard, { 
                                     position: 'absolute', 
                                     top, 
                                     height,
                                     left: `${(colIndex * (100 / numCols))}%`, 
                                     width: `${100 / numCols}%` 
                                 }]}>
                                    <AgendaCard 
                                        compact={!hasDuration}
                                        title={item.title}
                                        type={item.type as any}
                                        timeRange={item.timeRange}
                                        location={item.location}
                                        projectName={item.projectName}
                                        isActive={item.isActive}
                                        isCompleted={item.isCompleted}
                                        onToggle={item.onToggle}
                                        onPress={() => onItemPress && onItemPress(item)}
                                        startTime={item.startTime}
                                        durationMinutes={item.durationMinutes}
                                        verticalAlign={hasDuration ? 'flex-start' : 'center'}
                                    />
                                 </View>
                             );
                        })}
                        <View style={styles.divider} />
                    </View>
                </View>
            );
        })}

        {showNow && (
        <View style={[styles.nowLine, { top: nowTop, backgroundColor: accentColor }]}>
          <View style={[styles.nowBulb, { backgroundColor: accentColor }]} />
        </View>
        )}
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
  container: { flex: 1, overflow: 'hidden' },
  allDayContainer: { borderBottomWidth: 0.5, borderBottomColor: '#222', paddingTop: 6, paddingBottom: 6 },
  allDayHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, marginLeft: 20 },
  noTimeLabel: { fontSize: 11, fontWeight: '400' },
  noTimeCount: { fontSize: 11, fontWeight: '600' },
  allDayScroll: { height: NO_TIME_CARD_HEIGHT },
  allDayGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 6 },
  allDayCard: { width: '48%', height: NO_TIME_CARD_HEIGHT },
  scrollContent: { flexGrow: 0 },
  timelineScroll: { flex: 1 },
  hourRow: { flexDirection: 'row', alignItems: 'flex-start', overflow: 'visible' },
  hourRowSmall: { flexDirection: 'row', alignItems: 'center', overflow: 'visible' },
  hourSide: { width: SIDEBAR_WIDTH, height: '100%' },
  hourSideCompact: { justifyContent: 'center' },
  hourLabel: { width: SIDEBAR_WIDTH - 10, fontSize: 9, textAlign: 'center', textTransform: 'uppercase' },
  rail: { position: 'absolute', right: 7, width: 1.5, borderRadius: 1, opacity: 0.45 },
  railDot: { position: 'absolute', right: 3.5, top: 2, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5 },
  halfTick: { position: 'absolute', right: 2.5, top: EXPANDED_HEIGHT / 2 - 0.75, width: 10, height: 1.5, borderRadius: 1, opacity: 0.7, zIndex: 2 },
  halfLabel: {
    position: 'absolute',
    left: 0,
    height: 12,
    lineHeight: 12,
    top: EXPANDED_HEIGHT / 2 - 6,
    textAlignVertical: 'center',
  },
  slotContainer: { flex: 1, flexDirection: 'row', position: 'relative', zIndex: 1 },
  divider: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 0.5, backgroundColor: '#222', zIndex: -1 },
  flexCard: { zIndex: 100 },
  nowLine: { position: 'absolute', left: SIDEBAR_WIDTH, right: 0, height: 1 },
  nowBulb: { position: 'absolute', left: -4, top: -4, width: 8, height: 8, borderRadius: 4 },

  // Option 1: "Later today" floating chip
  floatingChipContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 200,
  },
  floatingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
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
