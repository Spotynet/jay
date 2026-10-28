import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { TIMELINE_TOKENS as T } from '../../utils/timelineTokens';

export type DayMetric = {
  id: string;
  label: string;
  value: number;
  max: number;
  color: string;
  onPress?: () => void;
};

interface DayMetricStripProps {
  metrics: DayMetric[];
}

const RING = 52;
const STROKE = 3.5;
const R = (RING - STROKE) / 2;
const C = 2 * Math.PI * R;

function MetricRing({ metric }: { metric: DayMetric }) {
  const { colors, isDark } = useTheme();
  const muted = colors.subtext;
  const track = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const progress = metric.max > 0 ? Math.min(1, Math.max(0, metric.value / metric.max)) : 0;
  const strokeDashoffset = C - progress * C;
  const Center = metric.onPress ? TouchableOpacity : View;

  return (
    <Center
      style={styles.metric}
      onPress={metric.onPress}
      activeOpacity={0.75}
      accessibilityRole={metric.onPress ? 'button' : 'text'}
      accessibilityLabel={`${metric.label}: ${metric.value} of ${metric.max}`}
    >
      <View style={styles.ringWrap}>
        <Svg width={RING} height={RING}>
          <Circle
            cx={RING / 2}
            cy={RING / 2}
            r={R}
            stroke={track}
            strokeWidth={STROKE}
            fill="none"
          />
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
        </Svg>
        <View style={styles.ringCenter} pointerEvents="none">
          <Text style={[styles.value, { color: colors.text }]}>
            {metric.value}
          </Text>
        </View>
      </View>
      <Text style={[styles.label, { color: muted }]} numberOfLines={1}>
        {metric.label}
      </Text>
    </Center>
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
      {/* Peek affordance when more metrics exist later */}
      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    marginBottom: 8,
  },
  scroll: {
    paddingHorizontal: T.pageInset,
    paddingVertical: 8,
    gap: 18,
    alignItems: 'center',
  },
  metric: {
    width: 64,
    alignItems: 'center',
    gap: 6,
  },
  ringWrap: {
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'lowercase',
  },
  spacer: {
    width: 12,
  },
});
