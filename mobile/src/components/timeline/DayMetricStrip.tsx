import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Pressable,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { IconCalendarDue } from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../ui/Icon';
import { ENTITY_ICONS } from '../../constants/entityIcons';
import { useResponsiveLayout } from '../../layout/responsive';
import { useTimelineTokens } from '../../layout/useTimelineTokens';
import {
  DayMetricModel,
  accessibilityMetricLabel,
  clampProgress,
} from '../../utils/dayMetrics';
import {
  DAY_METRIC_ITEM_GAP,
  DAY_METRIC_ITEM_WIDTH,
  ringsRequiredWidth,
  ringsShouldFit,
} from '../../utils/dayMetricStripLayout';

/** @deprecated Prefer DayMetricModel — kept as alias for existing imports. */
export type DayMetric = DayMetricModel;

interface DayMetricStripProps {
  metrics: DayMetricModel[];
}

/** Fixed square ring geometry — never derived independently. */
const RING = 52;
const STROKE = 3;
const R = (RING - STROKE) / 2;
const C = 2 * Math.PI * R;
const LABEL_ICON = 12;
const METRIC_WIDTH = DAY_METRIC_ITEM_WIDTH;
const METRIC_GAP = DAY_METRIC_ITEM_GAP;
const SCROLL_EDGE_EPS = 1;

const METRIC_ICONS: Record<string, any> = {
  tasks: ENTITY_ICONS.task,
  habits: ENTITY_ICONS.habit,
  events: ENTITY_ICONS.event,
  due: IconCalendarDue,
};

const withAlpha = (hex: string, alpha: number): string => {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

function MetricRing({
  metric,
  fillColumn = false,
}: {
  metric: DayMetricModel;
  /** When true, outer wrapper expands; circle stays fixed and centered. */
  fillColumn?: boolean;
}) {
  const { colors, isDark } = useTheme();
  const muted = colors.subtext;
  const track = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const isCompletion = metric.kind === 'completion';
  const progress = isCompletion ? clampProgress(metric.value, metric.total) : 0;
  const strokeDashoffset = C - progress * C;
  const a11y = accessibilityMetricLabel(metric);
  const labelIcon = METRIC_ICONS[metric.id] || ENTITY_ICONS.task;

  const center = isCompletion ? (
    <View style={styles.fraction} accessible={false}>
      <Text style={[styles.completedNum, { color: colors.text }]}>{metric.value}</Text>
      <Text style={[styles.slashTotal, { color: muted }]}>/{metric.total}</Text>
    </View>
  ) : (
    <Text style={[styles.countOnly, { color: colors.text }]} accessible={false}>
      {metric.value}
    </Text>
  );

  const body = (
    <>
      <View style={styles.ringWrap} pointerEvents="none">
        <Svg
          width={RING}
          height={RING}
          style={styles.ringSvg}
          viewBox={`0 0 ${RING} ${RING}`}
        >
          <Circle
            cx={RING / 2}
            cy={RING / 2}
            r={R}
            stroke={track}
            strokeWidth={STROKE}
            fill="none"
          />
          {progress > 0 ? (
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={R}
              stroke={metric.color}
              strokeWidth={STROKE}
              fill="none"
              strokeDasharray={`${C} ${C}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
            />
          ) : null}
        </Svg>
        {center}
      </View>

      <View
        style={[styles.labelRow, fillColumn && styles.labelRowFill]}
        accessible={false}
        importantForAccessibility="no"
        accessibilityElementsHidden
      >
        <Icon name={labelIcon} size={LABEL_ICON} color={metric.color} stroke={1.7} />
        <Text style={[styles.label, { color: muted }]} numberOfLines={1}>
          {metric.label}
        </Text>
      </View>
    </>
  );

  const metricStyle = fillColumn ? styles.metricFill : styles.metric;

  if (metric.onPress) {
    return (
      <Pressable
        style={metricStyle}
        onPress={metric.onPress}
        accessibilityRole="button"
        accessibilityLabel={a11y}
      >
        {body}
      </Pressable>
    );
  }

  return (
    <View style={metricStyle} accessibilityRole="text" accessibilityLabel={a11y}>
      {body}
    </View>
  );
}

export function DayMetricStrip({ metrics }: DayMetricStripProps) {
  const { colors } = useTheme();
  const layout = useResponsiveLayout();
  const T = useTimelineTokens();
  const scrollRef = useRef<ScrollView>(null);
  const [rowWidth, setRowWidth] = useState(0);
  const [fits, setFits] = useState(false);
  const [showLeadingFade, setShowLeadingFade] = useState(false);
  const [showTrailingFade, setShowTrailingFade] = useState(false);
  const scrollMetrics = useRef({ offset: 0, contentW: 0, layoutW: 0 });
  const fitsRef = useRef(false);

  const requiredWidth = useMemo(
    () => ringsRequiredWidth(metrics.length),
    [metrics.length],
  );

  const updateFit = useCallback(
    (available: number) => {
      const next = ringsShouldFit(available, metrics.length, fitsRef.current);
      if (next === fitsRef.current) return;
      fitsRef.current = next;
      setFits(next);
      if (next) {
        setShowLeadingFade(false);
        setShowTrailingFade(false);
        scrollMetrics.current.offset = 0;
        scrollRef.current?.scrollTo({ x: 0, animated: false });
      }
    },
    [metrics.length],
  );

  const updateFades = useCallback(() => {
    if (fitsRef.current) {
      setShowLeadingFade(false);
      setShowTrailingFade(false);
      return;
    }
    const { offset, contentW, layoutW } = scrollMetrics.current;
    const overflow = contentW > layoutW + SCROLL_EDGE_EPS && layoutW > 0;
    if (!overflow) {
      setShowLeadingFade(false);
      setShowTrailingFade(false);
      return;
    }
    const maxOffset = contentW - layoutW;
    setShowLeadingFade(offset > SCROLL_EDGE_EPS);
    setShowTrailingFade(offset < maxOffset - SCROLL_EDGE_EPS);
  }, []);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollMetrics.current.offset = e.nativeEvent.contentOffset.x;
      updateFades();
    },
    [updateFades],
  );

  const onContentSizeChange = useCallback(
    (w: number) => {
      scrollMetrics.current.contentW = w;
      updateFades();
    },
    [updateFades],
  );

  const onRowLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      setRowWidth(w);
      scrollMetrics.current.layoutW = w;
      updateFit(w);
      updateFades();
    },
    [updateFit, updateFades],
  );

  useEffect(() => {
    if (rowWidth > 0) updateFit(rowWidth);
  }, [metrics.length, rowWidth, updateFit]);

  if (metrics.length === 0) return null;

  const contentWidth = Math.min(layout.width, T.maxContentWidth);
  const bg = colors.background as string;
  const fadeClear = withAlpha(bg, 0);
  const fadeWidth = T.untimedEdgeFadeWidth;
  const useFit = fits && rowWidth >= requiredWidth;

  return (
    <View
      style={[
        styles.wrap,
        {
          width: contentWidth,
          alignSelf: 'center',
          paddingHorizontal: T.pageInset,
        },
      ]}
    >
      <View style={styles.scrollWrap} onLayout={onRowLayout}>
        {useFit ? (
          <View style={styles.fitRow} accessibilityRole="summary">
            {metrics.map((m) => (
              <View key={m.id} style={styles.fitColumn}>
                <MetricRing metric={m} fillColumn />
              </View>
            ))}
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            horizontal
            scrollEnabled
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            directionalLockEnabled
            bounces
            style={styles.container}
            contentContainerStyle={styles.scroll}
            onScroll={onScroll}
            onScrollEndDrag={onScroll}
            onMomentumScrollEnd={onScroll}
            scrollEventThrottle={16}
            onContentSizeChange={onContentSizeChange}
          >
            {metrics.map((m, index) => (
              <View
                key={m.id}
                style={[
                  styles.metricSlot,
                  index < metrics.length - 1 && { marginRight: METRIC_GAP },
                ]}
              >
                <MetricRing metric={m} />
              </View>
            ))}
          </ScrollView>
        )}

        {!useFit && showLeadingFade ? (
          <LinearGradient
            colors={[bg, fadeClear]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.edgeFadeLeft, { width: fadeWidth }]}
            pointerEvents="none"
            accessible={false}
            importantForAccessibility="no"
          />
        ) : null}
        {!useFit && showTrailingFade ? (
          <LinearGradient
            colors={[fadeClear, bg]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.edgeFadeRight, { width: fadeWidth }]}
            pointerEvents="none"
            accessible={false}
            importantForAccessibility="no"
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  scrollWrap: {
    position: 'relative',
    width: '100%',
  },
  container: {
    flexGrow: 0,
    marginBottom: 4,
  },
  scroll: {
    paddingVertical: 6,
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  fitRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'flex-start',
    paddingVertical: 6,
    marginBottom: 4,
  },
  fitColumn: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    alignItems: 'center',
  },
  metricSlot: {
    flexGrow: 0,
    flexShrink: 0,
    width: METRIC_WIDTH,
  },
  metric: {
    width: METRIC_WIDTH,
    flexGrow: 0,
    flexShrink: 0,
    alignItems: 'center',
  },
  metricFill: {
    width: '100%',
    alignItems: 'center',
  },
  ringWrap: {
    width: RING,
    height: RING,
    aspectRatio: 1,
    flexGrow: 0,
    flexShrink: 0,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  ringSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: RING,
    height: RING,
  },
  fraction: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  completedNum: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    lineHeight: 20,
  },
  slashTotal: {
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
    lineHeight: 16,
  },
  countOnly: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    lineHeight: 20,
    textAlign: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    width: '100%',
    maxWidth: METRIC_WIDTH,
  },
  labelRowFill: {
    maxWidth: '100%',
    paddingHorizontal: 2,
  },
  // 11pt label; letterSpacing ≈ 15% of font size.
  label: {
    marginLeft: 5,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 11 * 0.15,
    textTransform: 'capitalize',
    flexShrink: 1,
  },
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
});
