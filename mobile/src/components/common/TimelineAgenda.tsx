import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  LayoutChangeEvent,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { IconChevronDown, IconX } from 'tabler-icons-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import {
  AgendaItem,
  TimedAgendaItem,
  buildHourIntervals,
} from '../../utils/timelineLayout';
import { TIMELINE_TOKENS as T } from '../../utils/timelineTokens';
import { TimelineHourInterval } from '../timeline/TimelineHourInterval';
import { TimelineEventCard } from '../timeline/TimelineEventCard';
import { timelineColumnStyles, railAbsoluteLeft } from '../timeline/timelineColumns';

interface TimelineAgendaProps {
  items: AgendaItem[];
  onItemPress?: (item: AgendaItem) => void;
  onAddAtHour?: (hour: number, minute?: number) => void;
  now?: Date | null;
}

const formatTime = (date: Date): string => {
  const h = date.getHours();
  const m = date.getMinutes();
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const TimelineAgenda = ({
  items,
  onItemPress,
  onAddAtHour,
  now = null,
}: TimelineAgendaProps) => {
  const { colors, isDark } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [chipDismissed, setChipDismissed] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const rowOffsets = useRef<Record<string, number>>({});
  const didAutoScroll = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const allDayItems = useMemo(() => items.filter((item) => !item.startTime), [items]);
  const timedItems = useMemo(
    () => items.filter((item): item is TimedAgendaItem => item.startTime != null),
    [items],
  );

  const showNow = now != null;
  const intervals = useMemo(() => buildHourIntervals(timedItems), [timedItems]);

  const futureItems = useMemo(() => {
    const t = currentTime.getTime();
    return [...timedItems]
      .filter((item) => item.startTime.getTime() > t)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [timedItems, currentTime]);

  const nextItem = futureItems[0] ?? null;
  const nowHour = showNow ? currentTime.getHours() : -1;

  const contentWidth = Math.min(windowWidth, T.maxContentWidth);
  const railColor = isDark ? T.railColorDark : T.railColorLight;
  const untimedMixedTypes = useMemo(() => {
    const types = new Set(allDayItems.map((i) => i.type));
    return types.size > 1;
  }, [allDayItems]);

  const onRowLayout = useCallback((id: string, e: LayoutChangeEvent) => {
    rowOffsets.current[id] = e.nativeEvent.layout.y;
  }, []);

  const scrollToY = useCallback((y: number, animated = true) => {
    scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 40), animated });
  }, []);

  const scrollToItem = useCallback(
    (item: TimedAgendaItem) => {
      const id = `interval-${item.startTime.getHours()}`;
      const y = rowOffsets.current[id];
      if (typeof y === 'number') scrollToY(y);
    },
    [scrollToY],
  );

  useEffect(() => {
    if (!showNow || didAutoScroll.current) return;
    const timer = setTimeout(() => {
      const y = rowOffsets.current['now'] ?? rowOffsets.current[`interval-${nowHour}`];
      if (typeof y === 'number') {
        scrollToY(y);
        didAutoScroll.current = true;
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [showNow, nowHour, intervals, scrollToY]);

  useEffect(() => {
    didAutoScroll.current = false;
  }, [showNow]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {allDayItems.length > 0 && (
        <View style={styles.allDayContainer}>
          <View
            style={styles.allDayHeader}
            accessible
            accessibilityRole="header"
            accessibilityLabel={`No time, ${allDayItems.length} ${
              allDayItems.length === 1 ? 'item' : 'items'
            }`}
          >
            <Text style={[styles.noTimeLabel, { color: colors.subtext }]}>No time</Text>
            <Text style={[styles.noTimeCount, { color: colors.subtext }]}>
              {allDayItems.length}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            directionalLockEnabled
            style={styles.allDayScroll}
            contentContainerStyle={styles.allDayScrollContent}
            accessibilityRole="list"
          >
            {allDayItems.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.allDayCardWrap,
                  index < allDayItems.length - 1 && {
                    marginRight: T.untimedCardGap,
                  },
                ]}
              >
                <TimelineEventCard
                  compact
                  showTypeIcon={untimedMixedTypes}
                  item={item}
                  onPress={() => onItemPress?.(item)}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.timelineScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { width: contentWidth, alignSelf: 'center', paddingBottom: 28 },
        ]}
      >
        <View style={styles.timelineBody}>
          <View
            pointerEvents="none"
            accessible={false}
            importantForAccessibility="no"
            style={[
              styles.rail,
              {
                backgroundColor: railColor,
                left: railAbsoluteLeft(),
                width: T.railThickness,
              },
            ]}
          />

          {intervals.map((interval) => (
            <View key={interval.id} onLayout={(e) => onRowLayout(interval.id, e)}>
              <TimelineHourInterval
                hour={interval.hour}
                label={interval.timestampLabel}
                groups={interval.groups}
                onAdd={onAddAtHour ? () => onAddAtHour(interval.hour, 0) : undefined}
                onItemPress={onItemPress}
                nowIndicator={
                  showNow && nowHour === interval.hour ? (
                    <View
                      onLayout={(e) => onRowLayout('now', e)}
                      style={[timelineColumnStyles.row, styles.nowRow]}
                      accessible={false}
                      importantForAccessibility="no"
                    >
                      <View style={timelineColumnStyles.timeColumn} />
                      <View style={timelineColumnStyles.railColumn}>
                        <View
                          style={[
                            styles.nowBulb,
                            {
                              backgroundColor: colors.accent,
                              width: T.nowBulbSize,
                              height: T.nowBulbSize,
                              borderRadius: T.nowBulbSize / 2,
                            },
                          ]}
                        />
                      </View>
                      <View style={timelineColumnStyles.contentColumn}>
                        <View
                          style={[
                            styles.nowLine,
                            {
                              backgroundColor: colors.accent,
                              height: T.nowLineThickness,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ) : null
                }
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {futureItems.length > 0 && !chipDismissed && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={styles.floatingChipContainer}
        >
          <TouchableOpacity
            style={[
              styles.floatingChip,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => nextItem && scrollToItem(nextItem)}
            activeOpacity={0.8}
          >
            <IconChevronDown size={14} color={colors.subtext} stroke={2} />
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
  allDayContainer: {
    paddingTop: 2,
    paddingBottom: T.untimedSectionBottom,
  },
  allDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: T.pageInset,
    marginBottom: 5,
  },
  noTimeLabel: { fontSize: 11, fontWeight: '500', marginRight: 6 },
  noTimeCount: { fontSize: 11, fontWeight: '400', opacity: 0.8 },
  allDayScroll: {
    flexGrow: 0,
    width: '100%',
  },
  allDayScrollContent: {
    paddingHorizontal: T.pageInset,
    alignItems: 'center',
  },
  allDayCardWrap: {
    minWidth: T.untimedCardMinWidth,
    maxWidth: T.untimedCardMaxWidth,
  },
  timelineScroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingTop: 2 },
  timelineBody: {
    position: 'relative',
  },
  rail: {
    position: 'absolute',
    top: 10,
    bottom: 10,
    zIndex: 0,
  },
  nowRow: {
    minHeight: 18,
    marginVertical: 2,
  },
  nowBulb: {
    zIndex: 2,
  },
  nowLine: {
    borderRadius: 1,
    width: '100%',
  },
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
    borderWidth: StyleSheet.hairlineWidth,
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
