import React from 'react';
import { View, StyleSheet, Text, ScrollView, Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { IconCalendarDue } from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../ui/Icon';
import { ENTITY_ICONS } from '../../constants/entityIcons';
import { TIMELINE_TOKENS as T } from '../../utils/timelineTokens';
import {
  DayMetricModel,
  accessibilityMetricLabel,
  clampProgress,
} from '../../utils/dayMetrics';

/** @deprecated Prefer DayMetricModel — kept as alias for existing imports. */
export type DayMetric = DayMetricModel;

interface DayMetricStripProps {
  metrics: DayMetricModel[];
}

const RING = 52;
const STROKE = 3;
const R = (RING - STROKE) / 2;
const C = 2 * Math.PI * R;
const LABEL_ICON = 12;

const METRIC_ICONS: Record<string, any> = {
  tasks: ENTITY_ICONS.task,
  habits: ENTITY_ICONS.habit,
  events: ENTITY_ICONS.event,
  due: IconCalendarDue,
};

function MetricRing({ metric }: { metric: DayMetricModel }) {
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
        style={styles.labelRow}
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

  if (metric.onPress) {
    return (
      <Pressable
        style={styles.metric}
        onPress={metric.onPress}
        accessibilityRole="button"
        accessibilityLabel={a11y}
      >
        {body}
      </Pressable>
    );
  }

  return (
    <View style={styles.metric} accessibilityRole="text" accessibilityLabel={a11y}>
      {body}
    </View>
  );
}

export function DayMetricStrip({ metrics }: DayMetricStripProps) {
  if (metrics.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      style={styles.container}
    >
      {metrics.map((m) => (
        <MetricRing key={m.id} metric={m} />
      ))}
      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    marginBottom: 4,
  },
  scroll: {
    paddingHorizontal: T.pageInset,
    paddingVertical: 6,
    alignItems: 'flex-start',
  },
  metric: {
    width: 72,
    alignItems: 'center',
    marginRight: 14,
  },
  ringWrap: {
    width: RING,
    height: RING,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
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
  },
  // 11pt label; letterSpacing ≈ 15% of font size.
  label: {
    marginLeft: 5,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 11 * 0.15,
    textTransform: 'capitalize',
  },
  spacer: {
    width: 12,
  },
});
