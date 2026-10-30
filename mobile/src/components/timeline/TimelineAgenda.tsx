import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Alert,
  AccessibilityInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useReducedMotion } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import {
  AgendaItem,
  TimedAgendaItem,
  buildTimelineSections,
  findNowSectionIndex,
} from '../../utils/timelineLayout';
import {
  collectEndpointMinutes,
  collectTimelineIntervals,
  sectionIdForMinutes,
} from '../../utils/timelineInterval';
import { pruneSectionYs } from '../../utils/durationRailVisibility';
import {
  buildConnectedDurationLayout,
  scheduledIconCenterOffset,
  durationEndBoundsKey,
  CardBounds,
  ConnectedEndCard,
} from '../../utils/timelineConnectedDuration';
import { useResponsiveLayout } from '../../layout/responsive';
import {
  TAB_CHROME_GAP,
  scrollContentBottomClearance,
} from '../../layout/tabBarClearance';
import { useFloatingChromeBottom } from '../../layout/useFloatingChromeBottom';
import { useTimelineTokens } from '../../layout/useTimelineTokens';
import { TimelineHourInterval } from './TimelineHourInterval';
import { TimelineEventCard } from './TimelineEventCard';
import { TimelineDurationDecorations } from './TimelineDurationDecorations';
import { timelineColumnStyles, railAbsoluteLeft, rowInsetStyle } from './timelineColumns';

interface TimelineAgendaProps {
  items: AgendaItem[];
  onItemPress?: (item: AgendaItem) => void;
  onAddAtHour?: (hour: number, minute?: number) => void;
  now?: Date | null;
}

const SCROLL_EDGE_EPS = 1;

/** Keep fade interpolation in the same hue as the page background (avoids muddy `transparent`). */
const withAlpha = (hex: string, alpha: number): string => {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export const TimelineAgenda = ({
  items,
  onItemPress,
  onAddAtHour,
  now = null,
}: TimelineAgendaProps) => {
  const { colors, entityColors, isDark } = useTheme();
  const layout = useResponsiveLayout();
  const T = useTimelineTokens();
  // Measure this host vs window + safe-area / native-tab fallback so scroll
  // content can clear floating chrome without double-counting insets.
  const {
    tabOverlap,
    parentRef: chromeParentRef,
    onParentLayout: onChromeParentLayout,
  } = useFloatingChromeBottom(TAB_CHROME_GAP);
  const scrollBottomPad = scrollContentBottomClearance({ tabOverlap }, TAB_CHROME_GAP);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLeadingFade, setShowLeadingFade] = useState(false);
  const [showTrailingFade, setShowTrailingFade] = useState(false);
  const [untimedSnapOffsets, setUntimedSnapOffsets] = useState<number[]>([]);
  /** Section Y positions for duration end anchors (timeline body coords). */
  const [sectionYs, setSectionYs] = useState<Record<string, number>>({});
  /** Measured opaque card surfaces (timeline-body coords). */
  const [cardBounds, setCardBounds] = useState<Record<string, CardBounds>>({});
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const [scrollViewportH, setScrollViewportH] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const timelineBodyRef = useRef<View>(null);
  const rowOffsets = useRef<Record<string, number>>({});
  const scrollOffsetY = useRef(0);
  const cardBoundsRef = useRef<Record<string, CardBounds>>({});
  const revealGenRef = useRef(0);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didAutoScroll = useRef(false);
  const untimedScrollMetrics = useRef({ offset: 0, contentW: 0, layoutW: 0 });
  const untimedCardXs = useRef<Record<string, number>>({});
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const allDayItems = useMemo(() => items.filter((item) => !item.startTime), [items]);
  const allDayItemIds = useMemo(() => allDayItems.map((i) => i.id).join('|'), [allDayItems]);
  const timedItems = useMemo(
    () => items.filter((item): item is TimedAgendaItem => item.startTime != null),
    [items],
  );

  const showNow = now != null;
  const durationIntervals = useMemo(
    () => collectTimelineIntervals(timedItems),
    [timedItems],
  );
  const endpointMinutes = useMemo(
    () => collectEndpointMinutes(durationIntervals),
    [durationIntervals],
  );
  const sections = useMemo(
    () => buildTimelineSections(timedItems, { endpointMinutes }),
    [timedItems, endpointMinutes],
  );
  const sectionSignature = useMemo(
    () => sections.map((s) => s.id).join('|'),
    [sections],
  );
  useEffect(() => {
    // Prune stale Y anchors only. Never blank the map after onLayout —
    // RN will not re-fire onLayout for unchanged rows.
    const validIds = [...sections.map((s) => s.id), 'now'];
    setSectionYs((prev) => pruneSectionYs(prev, validIds));
    const valid = new Set(validIds);
    for (const id of Object.keys(rowOffsets.current)) {
      if (!valid.has(id)) delete rowOffsets.current[id];
    }
  }, [sectionSignature, sections]);

  const timedItemIds = useMemo(() => timedItems.map((i) => i.id).join('|'), [timedItems]);

  const nowSectionIndex = useMemo(() => {
    if (!showNow) return -1;
    return findNowSectionIndex(sections, currentTime);
  }, [showNow, sections, currentTime]);

  const contentWidth = Math.min(layout.width, T.maxContentWidth);
  const contentLeft = T.pageInset + T.contentOffsetX;
  const contentRight = contentWidth - T.pageInset;

  const connectedLayout = useMemo(
    () =>
      buildConnectedDurationLayout({
        items: timedItems,
        sectionYs,
        cardBounds,
        contentLeft,
        contentRight,
        iconCenterOffset: scheduledIconCenterOffset(
          T.scheduledCardPaddingH,
          T.scheduledIconContainer,
        ),
        estimatedCardHeight: T.scheduledCardMinHeight,
        sectionCardTopOffset: T.boundaryHeight + T.intervalPadVertical,
        railWidth: T.durationRailWidth,
        clearance: T.durationRailClearance,
        minRailSpan: T.durationMinRailSpan,
        minCardWidth: T.durationMinCardWidth,
        endCardHeight: T.durationEndCardHeight,
      }),
    [
      timedItems,
      sectionYs,
      cardBounds,
      contentLeft,
      contentRight,
      T.scheduledCardPaddingH,
      T.scheduledIconContainer,
      T.scheduledCardMinHeight,
      T.boundaryHeight,
      T.intervalPadVertical,
      T.durationRailWidth,
      T.durationRailClearance,
      T.durationMinRailSpan,
      T.durationMinCardWidth,
      T.durationEndCardHeight,
    ],
  );

  const indentByItemId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of connectedLayout.placements) {
      if (p.indent > 0) map[p.itemId] = p.indent;
    }
    return map;
  }, [connectedLayout.placements]);

  /** END cards keyed by exact end minutes — rendered inside that time block. */
  const endCardsByMinute = useMemo(() => {
    const map = new Map<number, ConnectedEndCard[]>();
    for (const rail of connectedLayout.rails) {
      if (!rail.endCard) continue;
      const iv = durationIntervals.find((i) => i.itemId === rail.itemId);
      if (!iv) continue;
      const mins = iv.displayEndMinutes;
      const list = map.get(mins) ?? [];
      list.push(rail.endCard);
      map.set(mins, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => a.itemId.localeCompare(b.itemId));
    }
    return map;
  }, [connectedLayout.rails, durationIntervals]);

  useEffect(() => {
    const valid = new Set(timedItems.map((i) => i.id));
    for (const rail of connectedLayout.rails) {
      if (rail.endCard) valid.add(durationEndBoundsKey(rail.itemId));
    }
    setCardBounds((prev) => {
      let changed = false;
      const next: Record<string, CardBounds> = {};
      for (const [id, b] of Object.entries(prev)) {
        if (valid.has(id)) next[id] = b;
        else changed = true;
      }
      return changed ? next : prev;
    });
  }, [timedItemIds, timedItems, connectedLayout.rails]);

  const onItemBounds = useCallback(
    (itemId: string, y: number, height: number, x: number, width: number) => {
      setCardBounds((prev) => {
        const cur = prev[itemId];
        if (
          cur &&
          Math.abs(cur.y - y) < 0.5 &&
          Math.abs(cur.height - height) < 0.5 &&
          Math.abs(cur.x - x) < 0.5 &&
          Math.abs(cur.width - width) < 0.5
        ) {
          return prev;
        }
        const next = { ...prev, [itemId]: { x, y, width, height } };
        cardBoundsRef.current = next;
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    cardBoundsRef.current = cardBounds;
  }, [cardBounds]);

  const clearHighlightTimer = useCallback(() => {
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Drop transient highlight when the day/items change.
    revealGenRef.current += 1;
    clearHighlightTimer();
    setHighlightedItemId(null);
  }, [timedItemIds, clearHighlightTimer]);

  useEffect(
    () => () => {
      revealGenRef.current += 1;
      clearHighlightTimer();
    },
    [clearHighlightTimer],
  );

  const entityColorForItem = useCallback(
    (item: AgendaItem) => {
      const key = (
        item.type === 'journal' || item.type === 'finance'
          ? item.type
          : `${item.type}s`
      ) as keyof typeof entityColors;
      return entityColors[key] || colors.accent;
    },
    [entityColors, colors.accent],
  );

  const endCardAccentFor = useCallback(
    (endCard: ConnectedEndCard) => {
      const item = timedItems.find((i) => i.id === endCard.itemId);
      return item ? entityColorForItem(item) : colors.accent;
    },
    [timedItems, entityColorForItem, colors.accent],
  );

  const endCardIconFor = useCallback(
    (endCard: ConnectedEndCard) => {
      const item = timedItems.find((i) => i.id === endCard.itemId);
      return item?.icon;
    },
    [timedItems],
  );

  const railColor = isDark ? T.railColorDark : T.railColorLight;
  const untimedMixedTypes = useMemo(() => {
    const types = new Set(allDayItems.map((i) => i.type));
    return types.size > 1;
  }, [allDayItems]);

  const onRowLayout = useCallback((id: string, e: LayoutChangeEvent) => {
    const y = e.nativeEvent.layout.y;
    rowOffsets.current[id] = y;
    setSectionYs((prev) => (prev[id] === y ? prev : { ...prev, [id]: y }));
  }, []);

  const scrollToY = useCallback((y: number, animated = true) => {
    scrollViewRef.current?.scrollTo({ y: Math.max(0, y), animated });
  }, []);

  const revealStartFromEndCard = useCallback(
    (endCard: ConnectedEndCard) => {
      const itemId = endCard.itemId;
      const item = timedItems.find((i) => i.id === itemId);
      if (!item || !item.startTime) {
        Alert.alert('Activity start unavailable');
        return;
      }

      const gen = ++revealGenRef.current;
      clearHighlightTimer();
      setHighlightedItemId(null);

      const applyHighlight = () => {
        if (revealGenRef.current !== gen) return;
        // Drop if the occurrence vanished mid-reveal.
        if (!timedItems.some((i) => i.id === itemId)) return;
        setHighlightedItemId(itemId);
        AccessibilityInfo.announceForAccessibility?.(
          `Showing start of ${item.title}`,
        );
        highlightTimerRef.current = setTimeout(() => {
          if (revealGenRef.current !== gen) return;
          setHighlightedItemId(null);
          highlightTimerRef.current = null;
        }, reduceMotion ? 600 : 1100);
      };

      const resolveTargetY = (): { y: number; height: number } | null => {
        const bounds = cardBoundsRef.current[itemId];
        if (bounds && typeof bounds.y === 'number') {
          return { y: bounds.y, height: bounds.height };
        }
        const mins =
          item.startTime!.getHours() * 60 + item.startTime!.getMinutes();
        const sectionY = sectionYs[sectionIdForMinutes(mins)];
        if (typeof sectionY === 'number') {
          return {
            y: sectionY + T.boundaryHeight + T.intervalPadVertical,
            height: T.scheduledCardMinHeight,
          };
        }
        return null;
      };

      const inset = 48;
      const isComfortablyVisible = (y: number, height: number) => {
        const viewTop = scrollOffsetY.current + inset;
        const viewBottom =
          scrollOffsetY.current +
          Math.max(scrollViewportH, 1) -
          inset -
          tabOverlap;
        return y >= viewTop && y + height <= viewBottom;
      };

      const MAX_ATTEMPTS = 10;
      const attemptReveal = (attempt: number) => {
        if (revealGenRef.current !== gen) return;
        const target = resolveTargetY();
        if (!target) {
          if (attempt < MAX_ATTEMPTS) {
            highlightTimerRef.current = setTimeout(
              () => attemptReveal(attempt + 1),
              reduceMotion ? 16 : 48,
            );
            return;
          }
          applyHighlight();
          return;
        }

        if (isComfortablyVisible(target.y, target.height)) {
          applyHighlight();
          return;
        }

        scrollToY(Math.max(0, target.y - inset), !reduceMotion);
        // Wait for scroll + layout; re-check before highlighting.
        highlightTimerRef.current = setTimeout(
          () => {
            if (revealGenRef.current !== gen) return;
            const again = resolveTargetY();
            if (again && !isComfortablyVisible(again.y, again.height) && attempt < MAX_ATTEMPTS) {
              scrollToY(Math.max(0, again.y - inset), !reduceMotion);
              highlightTimerRef.current = setTimeout(
                () => attemptReveal(attempt + 1),
                reduceMotion ? 16 : 120,
              );
              return;
            }
            applyHighlight();
          },
          reduceMotion ? 0 : 320,
        );
      };

      attemptReveal(0);
    },
    [
      timedItems,
      sectionYs,
      T.boundaryHeight,
      T.intervalPadVertical,
      T.scheduledCardMinHeight,
      scrollViewportH,
      tabOverlap,
      scrollToY,
      reduceMotion,
      clearHighlightTimer,
    ],
  );

  useEffect(() => {
    if (!showNow || didAutoScroll.current) return;
    const timer = setTimeout(() => {
      const clockSection =
        nowSectionIndex >= 0 ? sections[nowSectionIndex]?.id : undefined;
      const y =
        rowOffsets.current['now'] ??
        (clockSection ? rowOffsets.current[clockSection] : undefined);
      if (typeof y === 'number') {
        scrollToY(Math.max(0, y - 40));
        didAutoScroll.current = true;
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [showNow, nowSectionIndex, sections, scrollToY]);

  useEffect(() => {
    didAutoScroll.current = false;
  }, [showNow]);

  const updateUntimedFades = useCallback(() => {
    const { offset, contentW, layoutW } = untimedScrollMetrics.current;
    const overflow = contentW > layoutW + SCROLL_EDGE_EPS;
    if (!overflow || layoutW <= 0) {
      setShowLeadingFade(false);
      setShowTrailingFade(false);
      return;
    }
    const maxOffset = contentW - layoutW;
    setShowLeadingFade(offset > SCROLL_EDGE_EPS);
    setShowTrailingFade(offset < maxOffset - SCROLL_EDGE_EPS);
  }, []);

  const rebuildUntimedSnapOffsets = useCallback(() => {
    const { contentW, layoutW } = untimedScrollMetrics.current;
    const overflow = contentW > layoutW + SCROLL_EDGE_EPS && layoutW > 0;
    if (!overflow) {
      setUntimedSnapOffsets((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    const maxOffset = contentW - layoutW;
    const offsets: number[] = [0];
    for (const item of allDayItems) {
      const x = untimedCardXs.current[item.id];
      if (typeof x !== 'number') continue;
      const snap = Math.min(maxOffset, Math.max(0, x - T.pageInset));
      offsets.push(snap);
    }
    offsets.push(maxOffset);

    const unique = [...new Set(offsets.map((v) => Math.round(v * 100) / 100))].sort(
      (a, b) => a - b,
    );
    setUntimedSnapOffsets((prev) => {
      if (prev.length === unique.length && prev.every((v, i) => v === unique[i])) return prev;
      return unique;
    });
  }, [allDayItems, T.pageInset]);

  useEffect(() => {
    untimedCardXs.current = {};
    setUntimedSnapOffsets([]);
  }, [allDayItemIds]);

  const onUntimedScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      untimedScrollMetrics.current.offset = e.nativeEvent.contentOffset.x;
      updateUntimedFades();
    },
    [updateUntimedFades],
  );

  const onUntimedContentSizeChange = useCallback(
    (w: number) => {
      untimedScrollMetrics.current.contentW = w;
      updateUntimedFades();
      rebuildUntimedSnapOffsets();
    },
    [updateUntimedFades, rebuildUntimedSnapOffsets],
  );

  const onUntimedLayout = useCallback(
    (e: LayoutChangeEvent) => {
      untimedScrollMetrics.current.layoutW = e.nativeEvent.layout.width;
      updateUntimedFades();
      rebuildUntimedSnapOffsets();
    },
    [updateUntimedFades, rebuildUntimedSnapOffsets],
  );

  const onUntimedCardLayout = useCallback(
    (id: string, e: LayoutChangeEvent) => {
      untimedCardXs.current[id] = e.nativeEvent.layout.x;
      rebuildUntimedSnapOffsets();
    },
    [rebuildUntimedSnapOffsets],
  );

  const bg = colors.background as string;
  const fadeClear = withAlpha(bg, 0);

  return (
    <View
      ref={chromeParentRef}
      onLayout={onChromeParentLayout}
      style={[styles.container, { backgroundColor: colors.background }]}
      collapsable={false}
    >
      <View style={[styles.contentColumn, { width: contentWidth }]}>
        {allDayItems.length > 0 && (
          <View style={[styles.allDayContainer, { paddingBottom: T.untimedSectionBottom }]}>
            <View
              style={[styles.allDayHeader, { paddingHorizontal: T.pageInset }]}
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

            <View style={styles.allDayScrollWrap}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                directionalLockEnabled
                decelerationRate="fast"
                snapToOffsets={
                  untimedSnapOffsets.length > 1 ? untimedSnapOffsets : undefined
                }
                style={styles.allDayScroll}
                contentContainerStyle={[
                  styles.allDayScrollContent,
                  { paddingHorizontal: T.pageInset },
                ]}
                accessibilityRole="list"
                onScroll={onUntimedScroll}
                onScrollEndDrag={onUntimedScroll}
                onMomentumScrollEnd={onUntimedScroll}
                scrollEventThrottle={16}
                onContentSizeChange={onUntimedContentSizeChange}
                onLayout={onUntimedLayout}
              >
                {allDayItems.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.allDayCardWrap,
                      {
                        minWidth: T.untimedCardMinWidth,
                        maxWidth: T.untimedCardMaxWidth,
                      },
                      index < allDayItems.length - 1 && {
                        marginRight: T.untimedCardGap,
                      },
                    ]}
                    onLayout={(e) => onUntimedCardLayout(item.id, e)}
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

              {showLeadingFade && (
                <LinearGradient
                  colors={[bg, fadeClear]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.edgeFadeLeft, { width: T.untimedEdgeFadeWidth }]}
                  pointerEvents="none"
                  accessible={false}
                  importantForAccessibility="no"
                />
              )}
              {showTrailingFade && (
                <LinearGradient
                  colors={[fadeClear, bg]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.edgeFadeRight, { width: T.untimedEdgeFadeWidth }]}
                  pointerEvents="none"
                  accessible={false}
                  importantForAccessibility="no"
                />
              )}
            </View>
          </View>
        )}

        <ScrollView
          ref={scrollViewRef}
          style={styles.timelineScroll}
          showsVerticalScrollIndicator={false}
          // Avoid UIKit auto safe-area content insets — clearance is explicit
          // via scrollBottomPad (tab overlap + breathing room only).
          contentInsetAdjustmentBehavior="never"
          scrollIndicatorInsets={{ bottom: scrollBottomPad }}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: scrollBottomPad },
          ]}
          onLayout={(e) => setScrollViewportH(e.nativeEvent.layout.height)}
          onScroll={(e) => {
            scrollOffsetY.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        >
          <View ref={timelineBodyRef} style={styles.timelineBody} collapsable={false}>
            <View
              pointerEvents="none"
              accessible={false}
              importantForAccessibility="no"
              style={[
                styles.rail,
                {
                  backgroundColor: railColor,
                  left: railAbsoluteLeft(T.pageInset),
                  width: T.railThickness,
                },
              ]}
            />

            {/* Under cards: lines from icon centers + connected mini end cards. */}
            <TimelineDurationDecorations
              layer="under"
              layout={connectedLayout}
              items={timedItems}
              sectionYs={sectionYs}
              cardBounds={cardBounds}
              entityColorFor={entityColorForItem}
            />

            {sections.map((section, index) => (
              <View key={section.id} onLayout={(e) => onRowLayout(section.id, e)}>
                <TimelineHourInterval
                  label={section.timestampLabel}
                  groups={section.groups}
                  onAdd={
                    onAddAtHour
                      ? () => onAddAtHour(section.hour, section.minute)
                      : undefined
                  }
                  onItemPress={onItemPress}
                  contentAnchorRef={timelineBodyRef}
                  onItemBounds={onItemBounds}
                  indentByItemId={indentByItemId}
                  highlightedItemId={highlightedItemId}
                  endCards={endCardsByMinute.get(section.minutesFromMidnight) ?? []}
                  endCardAccentFor={endCardAccentFor}
                  endCardIconFor={endCardIconFor}
                  contentLeft={contentLeft}
                  onEndCardPress={revealStartFromEndCard}
                />
                {showNow && index === nowSectionIndex ? (
                  <View
                    onLayout={(e) => onRowLayout('now', e)}
                    style={[
                      timelineColumnStyles.row,
                      rowInsetStyle(T.pageInset),
                      styles.nowRow,
                    ]}
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
                ) : null}
              </View>
            ))}

            {/* Above cards: tappable overflow chips when nesting hits min width. */}
            <TimelineDurationDecorations
              layer="overflow"
              layout={connectedLayout}
              items={timedItems}
              sectionYs={sectionYs}
              cardBounds={cardBounds}
              entityColorFor={entityColorForItem}
              onItemPress={onItemPress}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentColumn: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
  },
  allDayContainer: {
    paddingTop: 2,
  },
  allDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  noTimeLabel: { fontSize: 11, fontWeight: '500', marginRight: 6 },
  noTimeCount: { fontSize: 11, fontWeight: '400', opacity: 0.8 },
  allDayScrollWrap: {
    position: 'relative',
    width: '100%',
  },
  allDayScroll: {
    flexGrow: 0,
    width: '100%',
  },
  allDayScrollContent: {
    alignItems: 'center',
  },
  allDayCardWrap: {},
  edgeFadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  edgeFadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
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
});
